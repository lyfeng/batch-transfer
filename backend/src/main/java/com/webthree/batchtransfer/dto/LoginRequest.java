package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 钱包登录请求
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@Schema(description = "钱包登录请求")
public class LoginRequest {
    
    @Schema(description = "钱包地址", example = "0x742d35Cc6eA5C4b8C3A9B37e8b02C5aB3A5c8f8E")
    @NotBlank(message = "钱包地址不能为空")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "钱包地址格式不正确")
    private String walletAddress;
    
    @Schema(description = "随机数", example = "a1b2c3d4e5f6789012345678901234567890abcd")
    @NotBlank(message = "随机数不能为空")
    private String nonce;
    
    @Schema(description = "钱包签名", example = "0x1234567890abcdef...")
    @NotBlank(message = "签名不能为空")
    private String signature;
}