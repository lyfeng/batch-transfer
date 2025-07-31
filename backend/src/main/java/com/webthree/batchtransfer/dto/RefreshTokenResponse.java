package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 刷新Token响应
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "刷新Token响应")
public class RefreshTokenResponse {
    
    @Schema(description = "新的访问Token")
    private String accessToken;
    
    @Schema(description = "Token类型", example = "Bearer")
    private String tokenType = "Bearer";
    
    @Schema(description = "访问Token过期时间（秒）", example = "7200")
    private Long expiresIn;
}