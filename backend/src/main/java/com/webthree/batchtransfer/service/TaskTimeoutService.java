package com.webthree.batchtransfer.service;

import com.webthree.batchtransfer.dto.TaskResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 任务超时处理服务
 * 定时检查并处理超时的执行中任务
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskTimeoutService {
    
    private final BatchTransferService batchTransferService;
    
    /**
     * 任务执行超时时间（分钟）
     */
    @Value("${batch-transfer.task.timeout-minutes:30}")
    private Integer taskTimeoutMinutes;
    
    /**
     * 定时检查超时任务
     * 每5分钟执行一次
     */
    @Scheduled(fixedRate = 300000) // 5分钟 = 300000毫秒
    public void checkTimeoutTasks() {
        log.info("开始检查超时任务，超时时间: {} 分钟", taskTimeoutMinutes);
        
        try {
            List<TaskResponse> timeoutTasks = batchTransferService.getTimeoutExecutingTasks(taskTimeoutMinutes);
            
            if (timeoutTasks.isEmpty()) {
                log.debug("没有发现超时任务");
                return;
            }
            
            log.warn("发现 {} 个超时任务", timeoutTasks.size());
            
            for (TaskResponse task : timeoutTasks) {
                try {
                    handleTimeoutTask(task);
                } catch (Exception e) {
                    log.error("处理超时任务失败: taskId={}, error={}", task.getId(), e.getMessage(), e);
                }
            }
            
        } catch (Exception e) {
            log.error("检查超时任务时发生错误", e);
        }
    }
    
    /**
     * 处理单个超时任务
     * 
     * @param task 超时任务
     */
    private void handleTimeoutTask(TaskResponse task) {
        log.warn("处理超时任务: taskId={}, taskName={}, executionToken={}, executionStartedAt={}", 
                task.getId(), task.getTaskName(), task.getExecutionToken(), task.getExecutionStartedAt());
        
        // TODO: 这里可以添加更复杂的逻辑
        // 1. 检查区块链上是否有对应的交易
        // 2. 根据执行令牌查询智能合约状态
        // 3. 如果确认没有执行，则回滚状态
        
        // 目前简单地将超时任务标记为失败
        String errorMessage = String.format("任务执行超时，超过 %d 分钟未完成", taskTimeoutMinutes);
        
        try {
            batchTransferService.rollbackTaskStatus(task.getId(), errorMessage);
            log.info("成功回滚超时任务: taskId={}", task.getId());
        } catch (Exception e) {
            log.error("回滚超时任务失败: taskId={}, error={}", task.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * 手动触发超时检查
     * 用于测试或紧急情况
     */
    public void manualCheckTimeoutTasks() {
        log.info("手动触发超时任务检查");
        checkTimeoutTasks();
    }
}