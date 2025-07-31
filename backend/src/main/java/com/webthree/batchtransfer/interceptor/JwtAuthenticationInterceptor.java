package com.webthree.batchtransfer.interceptor;

import com.webthree.batchtransfer.util.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT认证拦截器
 * 验证JWT Token并提取用户信息
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationInterceptor implements HandlerInterceptor {
    
    private final JwtUtils jwtUtils;
    
    /**
     * 钱包地址请求属性名
     */
    public static final String WALLET_ADDRESS_ATTRIBUTE = "walletAddress";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // 对于认证相关的接口，不需要验证Token
        String requestPath = request.getRequestURI();
        if (isAuthPath(requestPath)) {
            return true;
        }
        
        // 对于健康检查和Swagger文档，不需要验证Token
        if (isPublicPath(requestPath)) {
            return true;
        }
        
        try {
            // 获取Authorization头
            String authHeader = request.getHeader("Authorization");
            
            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                log.warn("缺少或无效的Authorization头: {}", requestPath);
                sendUnauthorizedResponse(response, "缺少认证Token");
                return false;
            }
            
            // 提取Token
            String token = authHeader.substring(7); // 移除"Bearer "前缀
            
            // 验证Token
            if (!jwtUtils.validateToken(token)) {
                log.warn("Token验证失败: {}", requestPath);
                sendUnauthorizedResponse(response, "Token无效或已过期");
                return false;
            }
            
            // 提取钱包地址
            String walletAddress = jwtUtils.getWalletAddressFromToken(token);
            
            // 将钱包地址设置到请求属性中，供后续使用
            request.setAttribute(WALLET_ADDRESS_ATTRIBUTE, walletAddress);
            
            log.debug("Token验证成功: walletAddress={}, path={}", walletAddress, requestPath);
            
            return true;
            
        } catch (Exception e) {
            log.error("Token验证过程发生错误: path={}", requestPath, e);
            sendUnauthorizedResponse(response, "认证失败");
            return false;
        }
    }
    
    /**
     * 判断是否为认证相关路径
     */
    private boolean isAuthPath(String path) {
        return path.startsWith("/api/v1/auth/");
    }
    
    /**
     * 判断是否为公开路径
     */
    private boolean isPublicPath(String path) {
        return path.startsWith("/api/v1/batch-transfer/health") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/api-docs") ||
               path.equals("/favicon.ico") ||
               path.startsWith("/actuator/health");
    }
    
    /**
     * 发送未授权响应
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        String jsonResponse = String.format(
            "{\"success\":false,\"code\":%d,\"message\":\"%s\",\"data\":null}",
            HttpServletResponse.SC_UNAUTHORIZED,
            message
        );
        
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}