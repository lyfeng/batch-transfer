package com.webthree.batchtransfer.service;

import com.webthree.batchtransfer.dto.CreateTaskRequest;
import com.webthree.batchtransfer.dto.TaskResponse;
import com.webthree.batchtransfer.dto.TransferItemResponse;
import com.webthree.batchtransfer.dto.UpdateTaskStatusRequest;
import com.webthree.batchtransfer.entity.BatchTransferTask;
import com.webthree.batchtransfer.entity.BatchTransferItem;
import com.webthree.batchtransfer.mapper.BatchTransferTaskMapper;
import com.webthree.batchtransfer.mapper.BatchTransferItemMapper;
import com.webthree.batchtransfer.util.EthUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 批量转账业务服务
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BatchTransferService {
    
    private final BatchTransferTaskMapper taskMapper;
    private final BatchTransferItemMapper itemMapper;
    
    /**
     * 创建批量转账任务
     * 
     * @param request 创建请求
     * @return 任务响应
     */
    @Transactional(rollbackFor = Exception.class)
    public TaskResponse createTask(CreateTaskRequest request) {
        log.info("创建批量转账任务: {}", request.getTaskName());
        
        // 验证转账项
        validateTransferItems(request.getTransferItems());
        
        // 计算总金额
        BigDecimal totalAmount = request.getTransferItems().stream()
                .map(CreateTaskRequest.TransferItemDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 创建任务实体
        BatchTransferTask task = BatchTransferTask.builder()
                .taskName(request.getTaskName())
                .totalRecipients(request.getTransferItems().size())
                .totalAmount(totalAmount)
                .status(BatchTransferTask.TaskStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        // 插入任务
        int taskInserted = taskMapper.insert(task);
        if (taskInserted != 1) {
            throw new RuntimeException("创建任务失败");
        }
        
        // 创建转账项
        List<BatchTransferItem> items = request.getTransferItems().stream()
                .map(dto -> BatchTransferItem.builder()
                        .taskId(task.getId())
                        .recipientAddress(dto.getAddress())
                        .amount(dto.getAmount())
                        .status(BatchTransferItem.ItemStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());
        
        // 批量插入转账项
        int itemsInserted = itemMapper.batchInsert(items);
        if (itemsInserted != items.size()) {
            throw new RuntimeException("创建转账项失败");
        }
        
        log.info("成功创建批量转账任务: ID={}, 名称={}, 转账项数量={}", 
                task.getId(), task.getTaskName(), items.size());
        
        return convertToTaskResponse(task);
    }
    
    /**
     * 获取所有任务列表
     * 
     * @return 任务列表
     */
    public List<TaskResponse> getAllTasks() {
        List<BatchTransferTask> tasks = taskMapper.selectAll();
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据ID获取任务详情
     * 
     * @param taskId 任务ID
     * @return 任务详情
     */
    public TaskResponse getTaskById(Long taskId) {
        BatchTransferTask task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在: " + taskId);
        }
        
        TaskResponse response = convertToTaskResponse(task);
        
        // 获取转账项列表
        List<BatchTransferItem> items = itemMapper.selectByTaskId(taskId);
        List<TransferItemResponse> itemResponses = items.stream()
                .map(this::convertToTransferItemResponse)
                .collect(Collectors.toList());
        response.setTransferItems(itemResponses);
        
        return response;
    }
    
    /**
     * 根据状态获取任务列表
     * 
     * @param status 任务状态
     * @return 任务列表
     */
    public List<TaskResponse> getTasksByStatus(BatchTransferTask.TaskStatus status) {
        List<BatchTransferTask> tasks = taskMapper.selectByStatus(status);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 更新任务状态
     * 
     * @param taskId 任务ID
     * @param request 更新请求
     * @return 更新后的任务
     */
    @Transactional(rollbackFor = Exception.class)
    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        log.info("更新任务状态: ID={}, 状态={}", taskId, request.getStatus());
        
        BatchTransferTask existingTask = taskMapper.selectById(taskId);
        if (existingTask == null) {
            throw new RuntimeException("任务不存在: " + taskId);
        }
        
        int updated = taskMapper.updateStatus(
                taskId, 
                request.getStatus(), 
                request.getTxHash(), 
                request.getErrorMessage()
        );
        
        if (updated != 1) {
            throw new RuntimeException("更新任务状态失败");
        }
        
        log.info("成功更新任务状态: ID={}, 新状态={}", taskId, request.getStatus());
        
        return getTaskById(taskId);
    }
    
    /**
     * 删除任务
     * 
     * @param taskId 任务ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteTask(Long taskId) {
        log.info("删除任务: ID={}", taskId);
        
        BatchTransferTask task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在: " + taskId);
        }
        
        // 只能删除待执行状态的任务
        if (task.getStatus() != BatchTransferTask.TaskStatus.PENDING) {
            throw new RuntimeException("只能删除待执行状态的任务");
        }
        
        // 删除转账项
        itemMapper.deleteByTaskId(taskId);
        
        // 删除任务
        taskMapper.deleteById(taskId);
        
        log.info("成功删除任务: ID={}", taskId);
    }
    
    /**
     * 验证转账项
     * 
     * @param items 转账项列表
     */
    private void validateTransferItems(List<CreateTaskRequest.TransferItemDto> items) {
        for (CreateTaskRequest.TransferItemDto item : items) {
            // 验证地址格式
            if (!EthUtils.isValidAddress(item.getAddress())) {
                throw new IllegalArgumentException("无效的以太坊地址: " + item.getAddress());
            }
            
            // 验证金额
            if (item.getAmount() == null || item.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("转账金额必须大于0");
            }
        }
    }
    
    /**
     * 转换为任务响应DTO
     * 
     * @param task 任务实体
     * @return 任务响应DTO
     */
    private TaskResponse convertToTaskResponse(BatchTransferTask task) {
        return TaskResponse.builder()
                .id(task.getId())
                .taskName(task.getTaskName())
                .totalRecipients(task.getTotalRecipients())
                .totalAmount(task.getTotalAmount())
                .status(task.getStatus())
                .txHash(task.getTxHash())
                .errorMessage(task.getErrorMessage())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
    
    /**
     * 转换为转账项响应DTO
     * 
     * @param item 转账项实体
     * @return 转账项响应DTO
     */
    private TransferItemResponse convertToTransferItemResponse(BatchTransferItem item) {
        return TransferItemResponse.builder()
                .id(item.getId())
                .recipientAddress(item.getRecipientAddress())
                .amount(item.getAmount())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .build();
    }
}