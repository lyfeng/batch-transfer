package com.webthree.batchtransfer.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT工具类
 * 用于生成、验证和解析JWT Token
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class JwtUtils {
    
    @Value("${app.auth.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.auth.jwt.expiration}")
    private long jwtExpiration;
    
    @Value("${app.auth.jwt.refresh-expiration}")
    private long refreshExpiration;
    
    /**
     * 生成访问Token
     * 
     * @param walletAddress 钱包地址
     * @return JWT Token
     */
    public String generateToken(String walletAddress) {
        return generateToken(walletAddress, jwtExpiration);
    }
    
    /**
     * 生成刷新Token
     * 
     * @param walletAddress 钱包地址
     * @return JWT刷新Token
     */
    public String generateRefreshToken(String walletAddress) {
        return generateToken(walletAddress, refreshExpiration);
    }
    
    /**
     * 生成Token（内部方法）
     * 
     * @param walletAddress 钱包地址
     * @param expiration 过期时间（毫秒）
     * @return JWT Token
     */
    private String generateToken(String walletAddress, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
                .setSubject(walletAddress.toLowerCase()) // 统一转为小写
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * 从Token中提取钱包地址
     * 
     * @param token JWT Token
     * @return 钱包地址
     */
    public String getWalletAddressFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }
    
    /**
     * 验证Token是否有效
     * 
     * @param token JWT Token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT Token已过期: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("不支持的JWT Token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("JWT Token格式错误: {}", e.getMessage());
        } catch (SignatureException e) {
            log.error("JWT Token签名无效: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT Token参数为空: {}", e.getMessage());
        }
        return false;
    }
    
    /**
     * 检查Token是否即将过期（30分钟内）
     * 
     * @param token JWT Token
     * @return 是否即将过期
     */
    public boolean isTokenExpiringSoon(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            Date expiration = claims.getExpiration();
            Date now = new Date();
            // 如果在30分钟内过期，返回true
            return expiration.getTime() - now.getTime() < 30 * 60 * 1000;
        } catch (Exception e) {
            return true; // 如果解析失败，认为需要刷新
        }
    }
    
    /**
     * 获取Token过期时间
     * 
     * @param token JWT Token
     * @return 过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }
    
    /**
     * 从Token中获取Claims
     * 
     * @param token JWT Token
     * @return Claims
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * 获取签名密钥
     * 
     * @return SecretKey
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}