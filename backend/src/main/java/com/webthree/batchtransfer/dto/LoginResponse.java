package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "登录响应")
public class LoginResponse {
    
    @Schema(description = "访问Token")
    private String accessToken;
    
    @Schema(description = "刷新Token")
    private String refreshToken;
    
    @Schema(description = "Token类型", example = "Bearer")
    private String tokenType = "Bearer";
    
    @Schema(description = "访问Token过期时间（秒）", example = "7200")
    private Long expiresIn;
    
    @Schema(description = "用户钱包地址", example = "0x742d35Cc6eA5C4b8C3A9B37e8b02C5aB3A5c8f8E")
    private String walletAddress;
}