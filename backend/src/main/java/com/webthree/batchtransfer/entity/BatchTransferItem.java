package com.webthree.batchtransfer.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 批量转账项实体类
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchTransferItem {
    
    /**
     * 项ID
     */
    private Long id;
    
    /**
     * 关联的任务ID
     */
    private Long taskId;
    
    /**
     * 接收地址
     */
    private String recipientAddress;
    
    /**
     * 转账金额 (ETH)
     */
    private BigDecimal amount;
    
    /**
     * 子项状态
     */
    private ItemStatus status;
    
    /**
     * 交易哈希（与任务共享）
     */
    private String txHash;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 项状态枚举
     */
    public enum ItemStatus {
        PENDING,
        SUCCESS,
        FAILED
    }
}