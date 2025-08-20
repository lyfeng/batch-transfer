package com.webthree.batchtransfer.util;

import lombok.experimental.UtilityClass;
import org.web3j.crypto.Hash;
import org.web3j.utils.Numeric;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.regex.Pattern;

/**
 * 以太坊工具类
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@UtilityClass
public class EthUtils {
    
    /**
     * 以太坊地址正则表达式
     */
    private static final Pattern ETH_ADDRESS_PATTERN = 
            Pattern.compile("^0x[a-fA-F0-9]{40}$");
    
    /**
     * 1 ETH = 10^18 Wei
     */
    private static final BigDecimal WEI_IN_ETH = new BigDecimal("1000000000000000000");
    
    /**
     * 验证以太坊地址格式
     * 
     * @param address 地址字符串
     * @return 是否为有效地址
     */
    public static boolean isValidAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return false;
        }
        
        String trimmedAddress = address.trim();
        
        // 基础格式验证
        if (!ETH_ADDRESS_PATTERN.matcher(trimmedAddress).matches()) {
            return false;
        }
        
        try {
            // 使用Web3j进行更严格的验证
            Numeric.toBigInt(trimmedAddress);
            
            // 验证checksum
            if (!isValidChecksum(trimmedAddress)) {
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 验证以太坊地址的checksum
     * 
     * @param address 地址字符串（必须包含0x前缀）
     * @return 是否为有效的checksum地址
     */
    public static boolean isValidChecksum(String address) {
        if (address == null || !address.startsWith("0x") || address.length() != 42) {
            return false;
        }
        
        // 如果地址全是小写或全是大写，则不需要checksum验证
        String addressPart = address.substring(2);
        if (addressPart.equals(addressPart.toLowerCase()) || 
            addressPart.equals(addressPart.toUpperCase())) {
            return true;
        }
        
        // 计算正确的checksum地址
        String correctChecksum = toChecksumAddress(address);
        return address.equals(correctChecksum);
    }
    
    /**
     * 将地址转换为checksum格式
     * 
     * @param address 原始地址
     * @return checksum格式的地址
     */
    public static String toChecksumAddress(String address) {
        if (address == null) {
            return null;
        }
        
        // 确保地址格式正确
        String cleanAddress = address.toLowerCase();
        if (!cleanAddress.startsWith("0x")) {
            cleanAddress = "0x" + cleanAddress;
        }
        
        if (cleanAddress.length() != 42) {
            throw new IllegalArgumentException("Invalid address length");
        }
        
        // 移除0x前缀进行hash计算
        String addressPart = cleanAddress.substring(2);
        
        // 计算keccak256哈希
        byte[] hash = Hash.sha3(addressPart.getBytes());
        String hashHex = Numeric.toHexStringNoPrefix(hash);
        
        // 根据哈希值确定大小写
        StringBuilder result = new StringBuilder("0x");
        for (int i = 0; i < addressPart.length(); i++) {
            char c = addressPart.charAt(i);
            if (Character.isDigit(c)) {
                result.append(c);
            } else {
                // 如果哈希值的对应位置大于等于8，则使用大写，否则使用小写
                int hashChar = Integer.parseInt(String.valueOf(hashHex.charAt(i)), 16);
                if (hashChar >= 8) {
                    result.append(Character.toUpperCase(c));
                } else {
                    result.append(Character.toLowerCase(c));
                }
            }
        }
        
        return result.toString();
    }
    
    /**
     * ETH转换为Wei
     * 
     * @param eth ETH数量
     * @return Wei数量
     */
    public static BigInteger ethToWei(BigDecimal eth) {
        if (eth == null) {
            return BigInteger.ZERO;
        }
        return eth.multiply(WEI_IN_ETH).toBigInteger();
    }
    
    /**
     * Wei转换为ETH
     * 
     * @param wei Wei数量
     * @return ETH数量
     */
    public static BigDecimal weiToEth(BigInteger wei) {
        if (wei == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(wei).divide(WEI_IN_ETH);
    }
    
    /**
     * 格式化以太坊地址（添加0x前缀，转换为小写）
     * 
     * @param address 原始地址
     * @return 格式化后的地址
     */
    public static String formatAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = address.trim().toLowerCase();
        if (!trimmed.startsWith("0x")) {
            trimmed = "0x" + trimmed;
        }
        
        return trimmed;
    }
    
    /**
     * 截断地址显示（用于UI显示）
     * 
     * @param address 完整地址
     * @return 截断后的地址（如：0x1234...5678）
     */
    public static String truncateAddress(String address) {
        if (address == null || address.length() < 10) {
            return address;
        }
        
        return address.substring(0, 6) + "..." + address.substring(address.length() - 4);
    }
}