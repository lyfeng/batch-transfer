package com.webthree.batchtransfer.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 批量转账任务实体类
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchTransferTask {
    
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
     * PENDING - 待执行
     * EXECUTING - 执行中
     * COMPLETED - 已完成
     * FAILED - 失败
     */
    private TaskStatus status;
    
    /**
     * 链上交易哈希
     */
    private String txHash;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 执行令牌，防止重复执行
     */
    private String executionToken;
    
    /**
     * 执行开始时间
     */
    private LocalDateTime executionStartedAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 最后更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 任务状态枚举
     */
    public enum TaskStatus {
        PENDING,
        EXECUTING, 
        COMPLETED,
        FAILED
    }
}