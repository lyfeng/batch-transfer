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
import java.util.UUID;
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
     * @param creatorAddress 创建者钱包地址
     * @return 任务响应
     */
    @Transactional(rollbackFor = Exception.class)
    public TaskResponse createTask(CreateTaskRequest request, String creatorAddress) {
        log.info("创建批量转账任务: {}, 创建者: {}", request.getTaskName(), creatorAddress);
        
        // 验证转账项
        validateTransferItems(request.getTransferItems());
        
        // 计算总金额
        BigDecimal totalAmount = request.getTransferItems().stream()
                .map(CreateTaskRequest.TransferItemDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 生成执行令牌
        String executionToken = generateExecutionToken();
        
        // 创建任务实体
        BatchTransferTask task = BatchTransferTask.builder()
                .taskName(request.getTaskName())
                .creatorAddress(creatorAddress.toLowerCase()) // 统一转为小写
                .totalRecipients(request.getTransferItems().size())
                .totalAmount(totalAmount)
                .status(BatchTransferTask.TaskStatus.PENDING)
                .executionToken(executionToken)
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
        
        log.info("成功创建批量转账任务: ID={}, 名称={}, 创建者={}, 转账项数量={}", 
                task.getId(), task.getTaskName(), creatorAddress, items.size());
        
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
     * 根据创建者地址获取任务列表
     * 
     * @param creatorAddress 创建者地址
     * @return 任务列表
     */
    public List<TaskResponse> getTasksByCreatorAddress(String creatorAddress) {
        List<BatchTransferTask> tasks = taskMapper.selectByCreatorAddress(creatorAddress);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据创建者地址和状态获取任务列表
     * 
     * @param creatorAddress 创建者地址
     * @param status 任务状态
     * @return 任务列表
     */
    public List<TaskResponse> getTasksByCreatorAddressAndStatus(String creatorAddress, BatchTransferTask.TaskStatus status) {
        List<BatchTransferTask> tasks = taskMapper.selectByCreatorAddressAndStatus(creatorAddress, status);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 更新任务状态
     */
    @Transactional(rollbackFor = Exception.class)
    public TaskResponse updateTaskStatus(Long taskId, UpdateTaskStatusRequest request) {
        log.info("更新任务状态: ID={}, 状态={}", taskId, request.getStatus());
        
        BatchTransferTask existingTask = taskMapper.selectById(taskId);
        if (existingTask == null) {
            throw new RuntimeException("任务不存在: " + taskId);
        }
        
        // 如果只是更新txHash而不更新状态
        if (request.getStatus() == null) {
            log.info("仅更新任务 {} 的交易哈希: {}", taskId, request.getTxHash());
            // 只更新txHash，不更新状态
            int updated = taskMapper.updateTxHashOnly(taskId, request.getTxHash());
            if (updated != 1) {
                throw new RuntimeException("更新交易哈希失败");
            }
            return getTaskById(taskId);
        }
        
        // 检查状态转换的合法性
        validateStatusTransition(existingTask.getStatus(), request.getStatus());
        
        // 如果是开始执行，设置执行开始时间
        LocalDateTime executionStartedAt = null;
        if (request.getStatus() == BatchTransferTask.TaskStatus.EXECUTING && 
            existingTask.getStatus() == BatchTransferTask.TaskStatus.PENDING) {
            executionStartedAt = LocalDateTime.now();
        }
        
        // 更新任务状态
        int updated = taskMapper.updateStatus(
                taskId, 
                request.getStatus(), 
                request.getTxHash(), 
                request.getErrorMessage(),
                null, // executionToken 在此处不更新
                executionStartedAt
        );
        
        if (updated != 1) {
            throw new RuntimeException("更新任务状态失败");
        }
        
        // 如果有交易哈希，同时更新所有转账项的交易哈希
        if (request.getTxHash() != null && !request.getTxHash().trim().isEmpty()) {
            BatchTransferItem.ItemStatus itemStatus;
            if (request.getStatus() == BatchTransferTask.TaskStatus.EXECUTING) {
                itemStatus = BatchTransferItem.ItemStatus.PENDING;
            } else if (request.getStatus() == BatchTransferTask.TaskStatus.COMPLETED) {
                itemStatus = BatchTransferItem.ItemStatus.SUCCESS;
            } else if (request.getStatus() == BatchTransferTask.TaskStatus.FAILED) {
                itemStatus = BatchTransferItem.ItemStatus.FAILED;
            } else {
                itemStatus = BatchTransferItem.ItemStatus.PENDING;
            }
            
            itemMapper.batchUpdateStatusAndTxHash(taskId, itemStatus, request.getTxHash());
            log.info("已更新任务 {} 的所有转账项状态为 {} 并设置交易哈希", taskId, itemStatus);
        }
        
        log.info("成功更新任务状态: ID={}, 新状态={}", taskId, request.getStatus());
        
        return getTaskById(taskId);
    }
    
    /**
     * 根据执行令牌查询任务
     * 
     * @param executionToken 执行令牌
     * @return 任务响应
     */
    public TaskResponse getTaskByExecutionToken(String executionToken) {
        log.info("根据执行令牌查询任务: {}", executionToken);
        
        BatchTransferTask task = taskMapper.selectByExecutionToken(executionToken);
        if (task == null) {
            throw new RuntimeException("任务不存在: " + executionToken);
        }
        
        return convertToTaskResponse(task);
    }
    
    /**
     * 查询超时的执行中任务
     * 
     * @param timeoutMinutes 超时分钟数
     * @return 超时任务列表
     */
    public List<TaskResponse> getTimeoutExecutingTasks(Integer timeoutMinutes) {
        log.info("查询超时的执行中任务，超时时间: {} 分钟", timeoutMinutes);
        
        List<BatchTransferTask> tasks = taskMapper.selectTimeoutExecutingTasks(timeoutMinutes);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 回滚任务状态（从执行中回到失败）
     * 
     * @param taskId 任务ID
     * @param errorMessage 错误信息
     * @return 任务响应
     */
    @Transactional(rollbackFor = Exception.class)
    public TaskResponse rollbackTaskStatus(Long taskId, String errorMessage) {
        log.info("回滚任务状态: ID={}, 错误信息={}", taskId, errorMessage);
        
        BatchTransferTask existingTask = taskMapper.selectById(taskId);
        if (existingTask == null) {
            throw new RuntimeException("任务不存在: " + taskId);
        }
        
        if (existingTask.getStatus() != BatchTransferTask.TaskStatus.EXECUTING) {
            throw new RuntimeException("只能回滚执行中的任务");
        }
        
        // 更新任务状态为失败，清除执行开始时间
        int updated = taskMapper.updateStatus(
                taskId,
                BatchTransferTask.TaskStatus.FAILED,
                null,
                errorMessage,
                null,
                null // 清除执行开始时间
        );
        
        if (updated != 1) {
            throw new RuntimeException("回滚任务状态失败");
        }
        
        // 更新所有转账项状态为失败
        itemMapper.batchUpdateStatusAndTxHash(taskId, BatchTransferItem.ItemStatus.FAILED, null);
        
        log.info("成功回滚任务状态: ID={}", taskId);
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
                .creatorAddress(task.getCreatorAddress())
                .totalRecipients(task.getTotalRecipients())
                .totalAmount(task.getTotalAmount())
                .status(task.getStatus())
                .txHash(task.getTxHash())
                .errorMessage(task.getErrorMessage())
                .executionToken(task.getExecutionToken())
                .executionStartedAt(task.getExecutionStartedAt())
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
    
    /**
     * 生成执行令牌
     * 
     * @return 执行令牌
     */
    private String generateExecutionToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * 验证状态转换的合法性
     * 
     * @param currentStatus 当前状态
     * @param newStatus 新状态
     */
    private void validateStatusTransition(BatchTransferTask.TaskStatus currentStatus, BatchTransferTask.TaskStatus newStatus) {
        // 定义合法的状态转换
        boolean isValidTransition = false;
        
        switch (currentStatus) {
            case PENDING:
                // PENDING 可以转换为 EXECUTING 或 FAILED
                isValidTransition = newStatus == BatchTransferTask.TaskStatus.EXECUTING || 
                                  newStatus == BatchTransferTask.TaskStatus.FAILED;
                break;
            case EXECUTING:
                // EXECUTING 可以转换为 COMPLETED 或 FAILED
                isValidTransition = newStatus == BatchTransferTask.TaskStatus.COMPLETED || 
                                  newStatus == BatchTransferTask.TaskStatus.FAILED;
                break;
            case COMPLETED:
            case FAILED:
                // COMPLETED 和 FAILED 是终态，不能再转换
                isValidTransition = false;
                break;
        }
        
        if (!isValidTransition) {
            throw new IllegalArgumentException(
                String.format("非法的状态转换: %s -> %s", currentStatus, newStatus)
            );
        }
    }
}