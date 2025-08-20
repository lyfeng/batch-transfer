package com.webthree.batchtransfer.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

/**
 * 创建批量转账任务请求DTO
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    
    /**
     * 任务名称
     */
    @NotBlank(message = "任务名称不能为空")
    @Size(max = 255, message = "任务名称长度不能超过255字符")
    private String taskName;
    
    /**
     * 转账项列表
     */
    @NotEmpty(message = "转账项列表不能为空")
    @Size(max = 200, message = "转账项数量不能超过200条")
    private List<TransferItemDto> transferItems;
    
    /**
     * 转账项DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferItemDto {
        
        /**
         * 接收地址
         */
        @NotBlank(message = "接收地址不能为空")
        private String address;
        
        /**
         * 转账金额 (ETH)
         */
        @NotNull(message = "转账金额不能为空")
        private BigDecimal amount;
    }
}