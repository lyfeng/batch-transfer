package com.webthree.batchtransfer.config;

import com.webthree.batchtransfer.interceptor.JwtAuthenticationInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置类
 * 注册拦截器和其他Web相关配置
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    
    private final JwtAuthenticationInterceptor jwtAuthenticationInterceptor;
    
    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(jwtAuthenticationInterceptor)
                .addPathPatterns("/api/v1/**") // 对所有API路径生效
                .excludePathPatterns(
                    "/api/v1/auth/challenge",  // 排除获取登录挑战接口
                    "/api/v1/auth/login",      // 排除登录接口
                    "/api/v1/auth/refresh",    // 排除刷新Token接口
                    "/api/v1/auth/logout",     // 排除登出接口
                    "/api/v1/debug/**",        // 排除调试接口
                    "/api/v1/batch-transfer/health" // 排除健康检查接口
                );
    }
}