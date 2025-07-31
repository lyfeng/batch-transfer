package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户信息响应
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "用户信息响应")
public class UserInfoResponse {
    
    @Schema(description = "钱包地址", example = "0x742d35Cc6eA5C4b8C3A9B37e8b02C5aB3A5c8f8E")
    private String walletAddress;
    
    @Schema(description = "Token是否即将过期", example = "false")
    private Boolean tokenExpiringSoon;
}