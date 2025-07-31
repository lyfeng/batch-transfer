package com.webthree.batchtransfer.dto;

import com.webthree.batchtransfer.entity.BatchTransferTask;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * 更新任务状态请求DTO
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskStatusRequest {
    
    /**
     * 任务状态
     */
    @NotNull(message = "任务状态不能为空")
    private BatchTransferTask.TaskStatus status;
    
    /**
     * 交易哈希
     */
    private String txHash;
    
    /**
     * 错误信息
     */
    private String errorMessage;
}