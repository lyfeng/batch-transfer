package com.webthree.batchtransfer.controller;

import com.webthree.batchtransfer.dto.*;
import com.webthree.batchtransfer.util.EthSignatureUtils;
import com.webthree.batchtransfer.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 提供钱包登录认证相关的REST API接口
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Validated
@Tag(name = "认证管理", description = "钱包登录认证相关接口")
public class AuthController {
    
    private final EthSignatureUtils ethSignatureUtils;
    private final JwtUtils jwtUtils;
    
    @Value("${app.auth.jwt.expiration}")
    private long jwtExpiration;
    
    /**
     * 获取登录挑战
     * 
     * @param request 挑战请求
     * @return 挑战信息
     */
    @PostMapping("/challenge")
    @Operation(summary = "获取登录挑战", description = "为钱包地址生成登录挑战消息")
    public ResponseEntity<ApiResponse<ChallengeResponse>> getChallenge(
            @Valid @RequestBody ChallengeRequest request) {
        
        log.info("获取登录挑战: walletAddress={}", request.getWalletAddress());
        
        try {
            EthSignatureUtils.Challenge challenge = ethSignatureUtils.generateChallenge(request.getWalletAddress());
            
            ChallengeResponse response = new ChallengeResponse(
                challenge.getNonce(),
                challenge.getMessage()
            );
            
            log.info("成功生成登录挑战: walletAddress={}, nonce={}", 
                    request.getWalletAddress(), challenge.getNonce());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("生成登录挑战失败: walletAddress={}", request.getWalletAddress(), e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("生成登录挑战失败: " + e.getMessage())
            );
        }
    }
    
    /**
     * 钱包签名登录
     * 
     * @param request 登录请求
     * @return 登录结果
     */
    @PostMapping("/login")
    @Operation(summary = "钱包签名登录", description = "使用钱包签名进行身份验证并获取JWT Token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        
        log.info("钱包登录请求: walletAddress={}, nonce={}", 
                request.getWalletAddress(), request.getNonce());
        
        try {
            // 验证签名
            boolean isValidSignature = ethSignatureUtils.verifyChallengeSignature(
                request.getNonce(),
                request.getSignature(),
                request.getWalletAddress()
            );
            
            if (!isValidSignature) {
                log.warn("签名验证失败: walletAddress={}, nonce={}", 
                        request.getWalletAddress(), request.getNonce());
                return ResponseEntity.badRequest().body(
                    ApiResponse.businessError("签名验证失败，请重新登录")
                );
            }
            
            // 生成JWT Token
            String accessToken = jwtUtils.generateToken(request.getWalletAddress());
            String refreshToken = jwtUtils.generateRefreshToken(request.getWalletAddress());
            
            LoginResponse response = LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration / 1000) // 转换为秒
                    .walletAddress(request.getWalletAddress().toLowerCase())
                    .build();
            
            log.info("用户登录成功: walletAddress={}", request.getWalletAddress());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("用户登录失败: walletAddress={}", request.getWalletAddress(), e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("登录失败: " + e.getMessage())
            );
        }
    }
    
    /**
     * 刷新Token
     * 
     * @param request 刷新请求
     * @return 新的Token
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新Token", description = "使用刷新Token获取新的访问Token")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        
        log.info("Token刷新请求");
        
        try {
            // 验证刷新Token
            if (!jwtUtils.validateToken(request.getRefreshToken())) {
                log.warn("刷新Token无效或已过期");
                return ResponseEntity.badRequest().body(
                    ApiResponse.businessError("刷新Token无效或已过期，请重新登录")
                );
            }
            
            // 从刷新Token中获取钱包地址
            String walletAddress = jwtUtils.getWalletAddressFromToken(request.getRefreshToken());
            
            // 生成新的访问Token
            String newAccessToken = jwtUtils.generateToken(walletAddress);
            
            RefreshTokenResponse response = RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration / 1000) // 转换为秒
                    .build();
            
            log.info("Token刷新成功: walletAddress={}", walletAddress);
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Token刷新失败", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("Token刷新失败: " + e.getMessage())
            );
        }
    }
    
    /**
     * 退出登录
     * 
     * @return 退出结果
     */
    @PostMapping("/logout")
    @Operation(summary = "退出登录", description = "退出当前登录状态")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        log.info("用户退出登录");
        
        try {
            // 这里可以添加Token黑名单逻辑
            // 由于我们使用的是无状态JWT，简单返回成功
            // 实际的退出由前端清除Token来实现
            
            return ResponseEntity.ok(ApiResponse.success());
            
        } catch (Exception e) {
            log.error("退出登录失败", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("退出登录失败: " + e.getMessage())
            );
        }
    }
    
    /**
     * 获取当前用户信息
     * 
     * @param authHeader Authorization头
     * @return 用户信息
     */
    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的基本信息")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // 提取Token
            String token = authHeader.replace("Bearer ", "");
            
            if (!jwtUtils.validateToken(token)) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.businessError("Token无效或已过期")
                );
            }
            
            String walletAddress = jwtUtils.getWalletAddressFromToken(token);
            
            UserInfoResponse response = UserInfoResponse.builder()
                    .walletAddress(walletAddress)
                    .tokenExpiringSoon(jwtUtils.isTokenExpiringSoon(token))
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("获取用户信息失败: " + e.getMessage())
            );
        }
    }
}