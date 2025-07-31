package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 刷新Token请求
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@Schema(description = "刷新Token请求")
public class RefreshTokenRequest {
    
    @Schema(description = "刷新Token")
    @NotBlank(message = "刷新Token不能为空")
    private String refreshToken;
}