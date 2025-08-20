package com.webthree.batchtransfer.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.webthree.batchtransfer.entity.BatchTransferTask;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 批量转账任务响应DTO
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    
    /**
     * 任务ID
     */
    private Long id;
    
    /**
     * 任务名称
     */
    private String taskName;
    
    /**
     * 创建者钱包地址
     */
    private String creatorAddress;
    
    /**
     * 总接收地址数量
     */
    private Integer totalRecipients;
    
    /**
     * 总转账金额 (ETH)
     */
    private BigDecimal totalAmount;
    
    /**
     * 任务状态
     */
    private BatchTransferTask.TaskStatus status;
    
    /**
     * 链上交易哈希
     */
    private String txHash;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 执行令牌
     */
    private String executionToken;
    
    /**
     * 执行开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime executionStartedAt;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 最后更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    /**
     * 转账项列表（详情查询时包含）
     */
    private List<TransferItemResponse> transferItems;
}