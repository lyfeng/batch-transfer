package com.webthree.batchtransfer.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.webthree.batchtransfer.entity.BatchTransferItem;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 转账项响应DTO
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferItemResponse {
    
    /**
     * 项ID
     */
    private Long id;
    
    /**
     * 接收地址
     */
    private String recipientAddress;
    
    /**
     * 转账金额 (ETH)
     */
    private BigDecimal amount;
    
    /**
     * 项状态
     */
    private BatchTransferItem.ItemStatus status;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
} 