package com.webthree.batchtransfer.util;

import com.webthree.batchtransfer.interceptor.JwtAuthenticationInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 认证工具类
 * 提供获取当前登录用户信息的便捷方法
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
public class AuthUtils {
    
    /**
     * 获取当前登录用户的钱包地址
     * 
     * @return 钱包地址，如果未登录则返回null
     */
    public static String getCurrentWalletAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return (String) request.getAttribute(JwtAuthenticationInterceptor.WALLET_ADDRESS_ATTRIBUTE);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 获取当前登录用户的钱包地址（必须存在）
     * 
     * @return 钱包地址
     * @throws RuntimeException 如果未登录
     */
    public static String requireCurrentWalletAddress() {
        String walletAddress = getCurrentWalletAddress();
        if (walletAddress == null) {
            throw new RuntimeException("用户未登录或认证信息无效");
        }
        return walletAddress;
    }
    
    /**
     * 检查当前用户是否已登录
     * 
     * @return 是否已登录
     */
    public static boolean isCurrentUserAuthenticated() {
        return getCurrentWalletAddress() != null;
    }
}