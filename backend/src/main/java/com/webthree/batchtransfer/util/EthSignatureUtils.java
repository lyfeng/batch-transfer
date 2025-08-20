package com.webthree.batchtransfer.util;

import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.crypto.digests.KeccakDigest;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.math.ec.ECCurve;
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
            String rHex = signature.substring(2, 66);
            String sHex = signature.substring(66, 130);
            String vHex = signature.substring(130, 132);
            
            log.debug("🔍 签名组件:");
            log.debug("  r: {}", rHex);
            log.debug("  s: {}", sHex);
            log.debug("  v: {}", vHex);
            
            BigInteger r = new BigInteger(rHex, 16);
            BigInteger s = new BigInteger(sHex, 16);
            int v = Integer.parseInt(vHex, 16);
            
            log.debug("🔍 解析后的签名组件:");
            log.debug("  r: {}", r.toString(16));
            log.debug("  s: {}", s.toString(16));
            log.debug("  v: {}", v);
            
            // 计算消息哈希
            byte[] messageHash = hashPersonalMessage(message);
            log.debug("🔍 消息哈希: {}", bytesToHex(messageHash));
            
            // 尝试所有可能的recovery值 (0, 1, 2, 3)
            for (int recovery = 0; recovery < 4; recovery++) {
                try {
                    log.debug("🔄 尝试recovery id: {}", recovery);
                    ECPoint publicKey = recoverPublicKey(messageHash, r, s, recovery);
                    
                    if (publicKey != null) {
                        String recoveredAddress = publicKeyToAddress(publicKey);
                        log.debug("  恢复的地址: {}", recoveredAddress);
                        
                        if (expectedAddress.equalsIgnoreCase(recoveredAddress)) {
                            log.info("✅ 签名验证成功: recovery={}, address={}", recovery, expectedAddress);
                            return true;
                        }
                    }
                } catch (Exception e) {
                    log.debug("❌ recovery {} 失败: {}", recovery, e.getMessage());
                }
            }
            
            log.warn("❌ 所有recovery尝试都失败");
            return false;
            
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
            
            // 添加详细的调试日志
            log.info("🔍 挑战签名验证详情:");
            log.info("  钱包地址: {}", walletAddress);
            log.info("  Nonce: {}", nonce);
            log.info("  消息长度: {}", challengeInfo.message.length());
            log.info("  消息前50字符: {}", challengeInfo.message.substring(0, Math.min(50, challengeInfo.message.length())));
            log.info("  签名: {}", signature);
            log.info("  签名长度: {}", signature.length());
            log.info("  验证结果: {}", isValid);
            
            if (isValid) {
                // 验证成功后移除挑战（防止重复使用）
                challengeCache.remove(nonce);
                log.info("✅ 挑战验证成功，已移除nonce: {}", nonce);
            } else {
                log.warn("❌ 挑战验证失败，保留nonce用于调试: {}", nonce);
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
     * 恢复公钥 - 使用简化的方法
     */
    private ECPoint recoverPublicKey(byte[] messageHash, BigInteger r, BigInteger s, int recovery) {
        try {
            ECNamedCurveParameterSpec spec = ECNamedCurveTable.getParameterSpec("secp256k1");
            ECCurve curve = spec.getCurve();
            BigInteger n = spec.getN();
            
            log.debug("🔍 恢复公钥参数:");
            log.debug("  r: {}", r.toString(16));
            log.debug("  s: {}", s.toString(16));
            log.debug("  recovery: {}", recovery);
            
            // 使用更简单的方法：直接构造压缩格式的公钥
            boolean isEven = (recovery & 1) == 0;
            byte[] rBytes = r.toByteArray();
            
            // 确保r是32字节
            if (rBytes.length > 32) {
                byte[] temp = new byte[32];
                System.arraycopy(rBytes, rBytes.length - 32, temp, 0, 32);
                rBytes = temp;
            } else if (rBytes.length < 32) {
                byte[] temp = new byte[32];
                System.arraycopy(rBytes, 0, temp, 32 - rBytes.length, rBytes.length);
                rBytes = temp;
            }
            
            // 构造压缩格式的点
            byte[] pointBytes = new byte[33];
            pointBytes[0] = (byte) (isEven ? 0x02 : 0x03);
            System.arraycopy(rBytes, 0, pointBytes, 1, 32);
            
            log.debug("  压缩点: {}", bytesToHex(pointBytes));
            
            // 解码点
            ECPoint R = curve.decodePoint(pointBytes);
            log.debug("  解码成功: R = ({}, {})", R.getAffineXCoord().toString(), R.getAffineYCoord().toString());
            
            // 如果recovery >= 2，需要添加n到x坐标
            if (recovery >= 2) {
                BigInteger x = R.getAffineXCoord().toBigInteger().add(n);
                BigInteger p = curve.getField().getCharacteristic();
                
                if (x.compareTo(p) >= 0) {
                    log.warn("x坐标超出范围: x={}, p={}", x.toString(16), p.toString(16));
                    return null;
                }
                
                // 重新计算点
                BigInteger ySquared = x.modPow(BigInteger.valueOf(3), p).add(BigInteger.valueOf(7)).mod(p);
                BigInteger y = sqrt(ySquared, p);
                if (y == null) {
                    log.warn("无法计算y坐标的平方根");
                    return null;
                }
                
                // 根据recovery的奇偶性选择正确的y
                if (y.testBit(0) != isEven) {
                    y = p.subtract(y);
                }
                
                R = curve.createPoint(x, y);
                log.debug("  重新计算的R: R = ({}, {})", R.getAffineXCoord().toString(), R.getAffineYCoord().toString());
            }
            
            // 计算公钥
            BigInteger e = new BigInteger(1, messageHash);
            BigInteger rInv = r.modInverse(n);
            
            BigInteger u1 = e.negate().mod(n);
            BigInteger u2 = s.mod(n);
            
            ECPoint publicKey = R.multiply(u2).add(spec.getG().multiply(u1)).multiply(rInv);
            
            // 标准化点
            publicKey = publicKey.normalize();
            
            log.debug("✅ 成功恢复公钥: ({}, {})", 
                publicKey.getAffineXCoord().toString(), 
                publicKey.getAffineYCoord().toString());
            
            return publicKey;
            
        } catch (Exception e) {
            log.debug("❌ recovery {} 失败: {}", recovery, e.getMessage());
            return null;
        }
    }
    
    /**
     * 计算模平方根 (Tonelli-Shanks算法)
     */
    private BigInteger sqrt(BigInteger n, BigInteger p) {
        try {
            // 对于 secp256k1，p = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1
            // p ≡ 3 (mod 4)，所以可以使用简化公式
            if (p.mod(BigInteger.valueOf(4)).equals(BigInteger.valueOf(3))) {
                BigInteger exp = p.add(BigInteger.ONE).divide(BigInteger.valueOf(4));
                BigInteger result = n.modPow(exp, p);
                
                // 验证结果
                if (result.multiply(result).mod(p).equals(n.mod(p))) {
                    return result;
                }
            }
            
            // 如果简化方法失败，使用通用的Tonelli-Shanks算法
            return tonelliShanks(n, p);
            
        } catch (Exception e) {
            log.warn("计算平方根失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Tonelli-Shanks算法计算模平方根
     */
    private BigInteger tonelliShanks(BigInteger n, BigInteger p) {
        try {
            // 检查n是否为二次剩余
            BigInteger legendre = n.modPow(p.subtract(BigInteger.ONE).divide(BigInteger.valueOf(2)), p);
            if (!legendre.equals(BigInteger.ONE)) {
                return null; // n不是二次剩余
            }
            
            // 简化情况：p ≡ 3 (mod 4)
            if (p.mod(BigInteger.valueOf(4)).equals(BigInteger.valueOf(3))) {
                return n.modPow(p.add(BigInteger.ONE).divide(BigInteger.valueOf(4)), p);
            }
            
            // 通用Tonelli-Shanks算法实现
            BigInteger s = BigInteger.ZERO;
            BigInteger q = p.subtract(BigInteger.ONE);
            
            while (q.mod(BigInteger.valueOf(2)).equals(BigInteger.ZERO)) {
                q = q.divide(BigInteger.valueOf(2));
                s = s.add(BigInteger.ONE);
            }
            
            if (s.equals(BigInteger.ONE)) {
                return n.modPow(p.add(BigInteger.ONE).divide(BigInteger.valueOf(4)), p);
            }
            
            // 寻找二次非剩余
            BigInteger z = BigInteger.valueOf(2);
            while (z.modPow(p.subtract(BigInteger.ONE).divide(BigInteger.valueOf(2)), p).equals(BigInteger.ONE)) {
                z = z.add(BigInteger.ONE);
            }
            
            BigInteger m = s;
            BigInteger c = z.modPow(q, p);
            BigInteger t = n.modPow(q, p);
            BigInteger r = n.modPow(q.add(BigInteger.ONE).divide(BigInteger.valueOf(2)), p);
            
            while (!t.equals(BigInteger.ONE)) {
                BigInteger temp = t;
                BigInteger i = BigInteger.ONE;
                
                while (!temp.multiply(temp).mod(p).equals(BigInteger.ONE)) {
                    temp = temp.multiply(temp).mod(p);
                    i = i.add(BigInteger.ONE);
                }
                
                BigInteger b = c.modPow(BigInteger.valueOf(2).modPow(m.subtract(i).subtract(BigInteger.ONE), p.subtract(BigInteger.ONE)), p);
                m = i;
                c = b.multiply(b).mod(p);
                t = t.multiply(c).mod(p);
                r = r.multiply(b).mod(p);
            }
            
            return r;
            
        } catch (Exception e) {
            log.warn("Tonelli-Shanks算法失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 从公钥计算以太坊地址
     */
    private String publicKeyToAddress(ECPoint publicKey) {
        try {
            // 获取未压缩的公钥字节（去掉前缀0x04）
            byte[] pubKeyBytes = publicKey.getEncoded(false);
            byte[] pubKeyHash = new byte[pubKeyBytes.length - 1]; // 去掉第一个字节0x04
            System.arraycopy(pubKeyBytes, 1, pubKeyHash, 0, pubKeyHash.length);
            
            // 计算Keccak-256哈希
            byte[] hash = keccak256(pubKeyHash);
            
            // 取最后20字节作为地址
            byte[] addressBytes = new byte[20];
            System.arraycopy(hash, hash.length - 20, addressBytes, 0, 20);
            
            // 转换为十六进制字符串并添加0x前缀
            StringBuilder address = new StringBuilder("0x");
            for (byte b : addressBytes) {
                address.append(String.format("%02x", b & 0xFF));
            }
            
            return address.toString();
            
        } catch (Exception e) {
            log.error("计算地址失败", e);
            return null;
        }
    }
    
    /**
     * 字节数组转十六进制字符串
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder("0x");
        for (byte b : bytes) {
            result.append(String.format("%02x", b & 0xFF));
        }
        return result.toString();
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