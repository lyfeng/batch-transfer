package com.webthree.batchtransfer.util;

import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.crypto.digests.KeccakDigest;
import org.bouncycastle.jcajce.provider.asymmetric.ec.BCECPublicKey;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.math.ec.ECPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.Security;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * 以太坊签名验证工具类
 * 用于验证钱包签名和生成挑战消息
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class EthSignatureUtils {
    
    @Value("${app.auth.challenge.expiration}")
    private long challengeExpiration;
    
    @Value("${app.auth.challenge.message-template}")
    private String messageTemplate;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    // 存储挑战信息的临时缓存
    private final ConcurrentMap<String, ChallengeInfo> challengeCache = new ConcurrentHashMap<>();
    
    static {
        // 注册Bouncy Castle提供程序
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }
    
    /**
     * 生成登录挑战
     * 
     * @param walletAddress 钱包地址
     * @return 挑战信息
     */
    public Challenge generateChallenge(String walletAddress) {
        String nonce = generateNonce();
        long timestamp = Instant.now().toEpochMilli();
        
        String message = messageTemplate
                .replace("{nonce}", nonce)
                .replace("{timestamp}", String.valueOf(timestamp));
        
        // 缓存挑战信息
        ChallengeInfo challengeInfo = new ChallengeInfo(walletAddress.toLowerCase(), message, timestamp + challengeExpiration);
        challengeCache.put(nonce, challengeInfo);
        
        // 清理过期的挑战
        cleanExpiredChallenges();
        
        log.info("生成登录挑战: address={}, nonce={}", walletAddress, nonce);
        
        return new Challenge(nonce, message);
    }
    
    /**
     * 验证以太坊签名
     * 
     * @param message 原始消息
     * @param signature 签名（hex格式，0x开头）
     * @param expectedAddress 期望的地址
     * @return 验证结果
     */
    public boolean verifySignature(String message, String signature, String expectedAddress) {
        try {
            // 清理地址格式
            expectedAddress = expectedAddress.toLowerCase();
            if (!expectedAddress.startsWith("0x")) {
                expectedAddress = "0x" + expectedAddress;
            }
            
            // 解析签名
            if (!signature.startsWith("0x")) {
                signature = "0x" + signature;
            }
            
            if (signature.length() != 132) { // 0x + 64 + 64 + 2 = 132
                log.error("签名长度错误: {}", signature.length());
                return false;
            }
            
            // 提取r, s, v
            BigInteger r = new BigInteger(signature.substring(2, 66), 16);
            BigInteger s = new BigInteger(signature.substring(66, 130), 16);
            int v = Integer.parseInt(signature.substring(130, 132), 16);
            
            // 如果v是27或28，转换为0或1
            if (v >= 27) {
                v -= 27;
            }
            
            // 计算消息哈希
            byte[] messageHash = hashPersonalMessage(message);
            
            // 恢复公钥
            ECPoint publicKey = recoverPublicKey(messageHash, r, s, v);
            if (publicKey == null) {
                log.error("无法恢复公钥");
                return false;
            }
            
            // 从公钥计算地址
            String recoveredAddress = publicKeyToAddress(publicKey);
            
            boolean isValid = expectedAddress.equalsIgnoreCase(recoveredAddress);
            if (isValid) {
                log.info("签名验证成功: address={}", expectedAddress);
            } else {
                log.warn("签名验证失败: expected={}, recovered={}", expectedAddress, recoveredAddress);
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("验证签名时发生错误", e);
            return false;
        }
    }
    
    /**
     * 验证挑战签名
     * 
     * @param nonce 挑战随机数
     * @param signature 签名
     * @param walletAddress 钱包地址
     * @return 验证结果
     */
    public boolean verifyChallengeSignature(String nonce, String signature, String walletAddress) {
        ChallengeInfo challengeInfo = challengeCache.get(nonce);
        
        if (challengeInfo == null) {
            log.warn("挑战不存在或已过期: nonce={}", nonce);
            return false;
        }
        
        if (!challengeInfo.walletAddress.equalsIgnoreCase(walletAddress)) {
            log.warn("挑战地址不匹配: expected={}, actual={}", challengeInfo.walletAddress, walletAddress);
            return false;
        }
        
        if (System.currentTimeMillis() > challengeInfo.expiryTime) {
            log.warn("挑战已过期: nonce={}", nonce);
            challengeCache.remove(nonce);
            return false;
        }
        
        boolean isValid = verifySignature(challengeInfo.message, signature, walletAddress);
        
        if (isValid) {
            // 验证成功后移除挑战（防止重复使用）
            challengeCache.remove(nonce);
        }
        
        return isValid;
    }
    
    /**
     * 生成随机nonce
     */
    private String generateNonce() {
        byte[] nonceBytes = new byte[16];
        secureRandom.nextBytes(nonceBytes);
        
        StringBuilder sb = new StringBuilder();
        for (byte b : nonceBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    /**
     * 计算个人消息哈希（以太坊标准）
     */
    private byte[] hashPersonalMessage(String message) {
        String prefix = "\u0019Ethereum Signed Message:\n" + message.length();
        String fullMessage = prefix + message;
        return keccak256(fullMessage.getBytes(StandardCharsets.UTF_8));
    }
    
    /**
     * Keccak256哈希
     */
    private byte[] keccak256(byte[] input) {
        KeccakDigest digest = new KeccakDigest(256);
        digest.update(input, 0, input.length);
        byte[] output = new byte[digest.getDigestSize()];
        digest.doFinal(output, 0);
        return output;
    }
    
    /**
     * 恢复公钥
     */
    private ECPoint recoverPublicKey(byte[] messageHash, BigInteger r, BigInteger s, int recovery) {
        try {
            ECNamedCurveParameterSpec spec = ECNamedCurveTable.getParameterSpec("secp256k1");
            BigInteger n = spec.getN();
            
            // 计算点R
            BigInteger x = r;
            ECPoint R = spec.getCurve().decodePoint(("03" + x.toString(16)).getBytes());
            
            if (!R.multiply(n).isInfinity()) {
                return null;
            }
            
            BigInteger e = new BigInteger(1, messageHash);
            BigInteger rInv = r.modInverse(n);
            
            BigInteger u1 = e.negate().mod(n);
            BigInteger u2 = s.mod(n);
            
            ECPoint point = R.multiply(u2).add(spec.getG().multiply(u1)).multiply(rInv);
            
            return point;
            
        } catch (Exception e) {
            log.error("恢复公钥失败", e);
            return null;
        }
    }
    
    /**
     * 从公钥计算以太坊地址
     */
    private String publicKeyToAddress(ECPoint publicKey) {
        byte[] pubKeyBytes = publicKey.getEncoded(false);
        // 去掉第一个字节（0x04前缀）
        byte[] pubKeyNoPrefix = new byte[pubKeyBytes.length - 1];
        System.arraycopy(pubKeyBytes, 1, pubKeyNoPrefix, 0, pubKeyNoPrefix.length);
        
        byte[] hash = keccak256(pubKeyNoPrefix);
        
        // 取最后20字节作为地址
        byte[] addressBytes = new byte[20];
        System.arraycopy(hash, hash.length - 20, addressBytes, 0, 20);
        
        StringBuilder sb = new StringBuilder("0x");
        for (byte b : addressBytes) {
            sb.append(String.format("%02x", b));
        }
        
        return sb.toString();
    }
    
    /**
     * 清理过期的挑战
     */
    private void cleanExpiredChallenges() {
        long now = System.currentTimeMillis();
        challengeCache.entrySet().removeIf(entry -> entry.getValue().expiryTime < now);
    }
    
    /**
     * 挑战信息
     */
    private static class ChallengeInfo {
        final String walletAddress;
        final String message;
        final long expiryTime;
        
        ChallengeInfo(String walletAddress, String message, long expiryTime) {
            this.walletAddress = walletAddress;
            this.message = message;
            this.expiryTime = expiryTime;
        }
    }
    
    /**
     * 挑战结果
     */
    public static class Challenge {
        private final String nonce;
        private final String message;
        
        public Challenge(String nonce, String message) {
            this.nonce = nonce;
            this.message = message;
        }
        
        public String getNonce() {
            return nonce;
        }
        
        public String getMessage() {
            return message;
        }
    }
}