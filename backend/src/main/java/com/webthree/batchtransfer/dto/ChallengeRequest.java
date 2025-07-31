package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 获取登录挑战请求
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@Schema(description = "获取登录挑战请求")
public class ChallengeRequest {
    
    @Schema(description = "钱包地址", example = "0x742d35Cc6eA5C4b8C3A9B37e8b02C5aB3A5c8f8E")
    @NotBlank(message = "钱包地址不能为空")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "钱包地址格式不正确")
    private String walletAddress;
}