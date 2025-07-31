package com.webthree.batchtransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 登录挑战响应
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@AllArgsConstructor
@Schema(description = "登录挑战响应")
public class ChallengeResponse {
    
    @Schema(description = "随机数", example = "a1b2c3d4e5f6789012345678901234567890abcd")
    private String nonce;
    
    @Schema(description = "需要签名的消息")
    private String message;
}