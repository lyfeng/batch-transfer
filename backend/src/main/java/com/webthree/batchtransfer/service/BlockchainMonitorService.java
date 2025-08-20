package com.webthree.batchtransfer.service;

import com.webthree.batchtransfer.entity.BatchTransferTask;
import com.webthree.batchtransfer.entity.BatchTransferItem;
import com.webthree.batchtransfer.mapper.BatchTransferTaskMapper;
import com.webthree.batchtransfer.mapper.BatchTransferItemMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;

import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

/**
 * 区块链监听服务
 * 负责监听交易状态变化并更新任务状态
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainMonitorService {
    
    private final Web3j web3j;
    private final BatchTransferTaskMapper taskMapper;
    private final BatchTransferItemMapper itemMapper;
    
    /**
     * 定时检查执行中的任务状态
     * 每30秒执行一次
     */
    @Scheduled(fixedDelay = 30000, initialDelay = 10000)
    @Async
    public void monitorExecutingTasks() {
        log.debug("开始监听执行中的任务状态");
        
        try {
            // 获取所有执行中的任务
            List<BatchTransferTask> executingTasks = taskMapper.selectByStatus(BatchTransferTask.TaskStatus.EXECUTING);
            
            if (executingTasks.isEmpty()) {
                log.debug("没有执行中的任务");
                return;
            }
            
            log.info("发现 {} 个执行中的任务，开始检查状态", executingTasks.size());
            
            for (BatchTransferTask task : executingTasks) {
                checkTaskTransactionStatus(task);
            }
            
        } catch (Exception e) {
            log.error("监听任务状态时发生错误", e);
        }
    }
    
    /**
     * 检查单个任务的交易状态
     * 
     * @param task 任务对象
     */
    @Async
    public void checkTaskTransactionStatus(BatchTransferTask task) {
        if (task.getTxHash() == null || task.getTxHash().trim().isEmpty()) {
            log.warn("任务 {} 没有交易哈希，跳过状态检查", task.getId());
            return;
        }
        
        try {
            log.debug("检查任务 {} 的交易状态，txHash: {}", task.getId(), task.getTxHash());
            
            // 查询交易收据
            Optional<TransactionReceipt> receiptOptional = web3j.ethGetTransactionReceipt(task.getTxHash())
                    .send()
                    .getTransactionReceipt();
            
            if (receiptOptional.isPresent()) {
                TransactionReceipt receipt = receiptOptional.get();
                updateTaskStatusBasedOnReceipt(task, receipt);
            } else {
                // 交易还未被确认，保持执行中状态
                log.debug("任务 {} 的交易尚未被确认，txHash: {}", task.getId(), task.getTxHash());
                
                // 检查是否超时（可选：如果交易超过一定时间未确认，可以标记为失败）
                checkTransactionTimeout(task);
            }
            
        } catch (Exception e) {
            log.error("检查任务 {} 交易状态时发生错误，txHash: {}", task.getId(), task.getTxHash(), e);
            
            // 如果查询失败，可以考虑重试或标记为失败
            updateTaskStatusToFailed(task.getId(), "查询交易状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据交易收据更新任务状态
     */
    @Transactional(rollbackFor = Exception.class)
    private void updateTaskStatusBasedOnReceipt(BatchTransferTask task, TransactionReceipt receipt) {
        String txHash = task.getTxHash();
        Long taskId = task.getId();
        
        // 检查交易是否成功
        if (receipt.isStatusOK()) {
            // 交易成功
            log.info("任务 {} 执行成功，txHash: {}, gasUsed: {}", 
                    taskId, txHash, receipt.getGasUsed());
            
            // 更新任务状态
            int updated = taskMapper.updateStatus(
                    taskId, 
                    BatchTransferTask.TaskStatus.COMPLETED, 
                    txHash, 
                    null, // executionToken
                    null, // errorMessage
                    null  // executionStartedAt
            );
            
            if (updated > 0) {
                // 同时更新所有转账项状态为成功
                itemMapper.batchUpdateStatusAndTxHash(
                    taskId, 
                    BatchTransferItem.ItemStatus.SUCCESS, 
                    txHash
                );
                log.info("成功更新任务 {} 及其所有转账项状态为已完成", taskId);
            } else {
                log.error("更新任务 {} 状态失败", taskId);
            }
            
        } else {
            // 交易失败
            String errorMessage = extractErrorMessage(receipt);
            log.warn("任务 {} 执行失败，txHash: {}, 错误信息: {}", 
                    taskId, txHash, errorMessage);
            
            updateTaskStatusToFailed(taskId, errorMessage);
            
            // 同时更新所有转账项状态为失败
            itemMapper.batchUpdateStatusAndTxHash(
                taskId, 
                BatchTransferItem.ItemStatus.FAILED, 
                txHash
            );
        }
    }
    
    /**
     * 更新任务状态为失败
     * 
     * @param taskId 任务ID
     * @param errorMessage 错误信息
     */
    @Transactional(rollbackFor = Exception.class)
    private void updateTaskStatusToFailed(Long taskId, String errorMessage) {
        int updated = taskMapper.updateStatus(
                taskId, 
                BatchTransferTask.TaskStatus.FAILED, 
                null, // txHash
                null, // executionToken
                errorMessage, 
                null  // executionStartedAt
        );
        
        if (updated > 0) {
            log.info("成功更新任务 {} 状态为失败，错误信息: {}", taskId, errorMessage);
        } else {
            log.error("更新任务 {} 状态为失败时出错", taskId);
        }
    }
    
    /**
     * 检查交易是否超时
     * 
     * @param task 任务对象
     */
    private void checkTransactionTimeout(BatchTransferTask task) {
        // 如果任务执行时间超过30分钟，标记为超时失败
        if (task.getUpdatedAt() != null) {
            long minutesSinceUpdate = java.time.Duration.between(
                    task.getUpdatedAt(), 
                    java.time.LocalDateTime.now()
            ).toMinutes();
            
            if (minutesSinceUpdate > 30) {
                log.warn("任务 {} 执行超时（{}分钟），标记为失败", task.getId(), minutesSinceUpdate);
                updateTaskStatusToFailed(task.getId(), "交易执行超时");
            }
        }
    }
    
    /**
     * 从交易收据中提取错误信息
     * 
     * @param receipt 交易收据
     * @return 错误信息
     */
    private String extractErrorMessage(TransactionReceipt receipt) {
        // 基础错误信息
        StringBuilder errorMsg = new StringBuilder("交易执行失败");
        
        // 添加Gas信息
        if (receipt.getGasUsed() != null) {
            errorMsg.append("，Gas已消耗: ").append(receipt.getGasUsed());
        }
        
        // 可以根据需要添加更多错误信息解析逻辑
        // 例如解析revert reason等
        
        return errorMsg.toString();
    }
    
    /**
     * 手动检查指定任务的状态
     * 
     * @param taskId 任务ID
     */
    @Async
    public void checkTaskStatus(Long taskId) {
        log.info("手动检查任务 {} 的状态", taskId);
        
        BatchTransferTask task = taskMapper.selectById(taskId);
        if (task == null) {
            log.warn("任务 {} 不存在", taskId);
            return;
        }
        
        if (task.getStatus() != BatchTransferTask.TaskStatus.EXECUTING) {
            log.warn("任务 {} 不是执行中状态，当前状态: {}", taskId, task.getStatus());
            return;
        }
        
        checkTaskTransactionStatus(task);
    }
    
    /**
     * 获取当前区块高度
     * 
     * @return 当前区块高度
     */
    public BigInteger getCurrentBlockNumber() {
        try {
            return web3j.ethBlockNumber().send().getBlockNumber();
        } catch (Exception e) {
            log.error("获取当前区块高度失败", e);
            return BigInteger.ZERO;
        }
    }
    
    /**
     * 检查Web3j连接状态
     * 
     * @return 是否连接正常
     */
    public boolean isWeb3jConnected() {
        try {
            web3j.ethBlockNumber().send();
            return true;
        } catch (Exception e) {
            log.error("Web3j连接检查失败", e);
            return false;
        }
    }
}