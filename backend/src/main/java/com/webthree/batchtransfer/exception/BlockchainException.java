package com.webthree.batchtransfer.exception;

/**
 * 区块链异常类
 * 用于处理与区块链交互相关的异常情况
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
public class BlockchainException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private String errorCode;

    /**
     * 交易哈希（如果相关）
     */
    private String txHash;

    /**
     * 区块号（如果相关）
     */
    private Long blockNumber;

    /**
     * 构造函数
     * 
     * @param message 错误消息
     */
    public BlockchainException(String message) {
        super(message);
    }

    /**
     * 构造函数
     * 
     * @param message 错误消息
     * @param cause 原因
     */
    public BlockchainException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * 构造函数
     * 
     * @param errorCode 错误码
     * @param message 错误消息
     */
    public BlockchainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * 构造函数
     * 
     * @param errorCode 错误码
     * @param message 错误消息
     * @param cause 原因
     */
    public BlockchainException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    /**
     * 构造函数
     * 
     * @param errorCode 错误码
     * @param message 错误消息
     * @param txHash 交易哈希
     */
    public BlockchainException(String errorCode, String message, String txHash) {
        super(message);
        this.errorCode = errorCode;
        this.txHash = txHash;
    }

    /**
     * 获取错误码
     * 
     * @return 错误码
     */
    public String getErrorCode() {
        return errorCode;
    }

    /**
     * 设置错误码
     * 
     * @param errorCode 错误码
     */
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    /**
     * 获取交易哈希
     * 
     * @return 交易哈希
     */
    public String getTxHash() {
        return txHash;
    }

    /**
     * 设置交易哈希
     * 
     * @param txHash 交易哈希
     */
    public void setTxHash(String txHash) {
        this.txHash = txHash;
    }

    /**
     * 获取区块号
     * 
     * @return 区块号
     */
    public Long getBlockNumber() {
        return blockNumber;
    }

    /**
     * 设置区块号
     * 
     * @param blockNumber 区块号
     */
    public void setBlockNumber(Long blockNumber) {
        this.blockNumber = blockNumber;
    }

    // 常用的区块链异常静态方法

    /**
     * 连接失败异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException connectionFailed(String message) {
        return new BlockchainException("CONNECTION_FAILED", message);
    }

    /**
     * 连接失败异常
     * 
     * @param message 错误消息
     * @param cause 原因
     * @return BlockchainException
     */
    public static BlockchainException connectionFailed(String message, Throwable cause) {
        return new BlockchainException("CONNECTION_FAILED", message, cause);
    }

    /**
     * 交易失败异常
     * 
     * @param message 错误消息
     * @param txHash 交易哈希
     * @return BlockchainException
     */
    public static BlockchainException transactionFailed(String message, String txHash) {
        return new BlockchainException("TRANSACTION_FAILED", message, txHash);
    }

    /**
     * 交易超时异常
     * 
     * @param message 错误消息
     * @param txHash 交易哈希
     * @return BlockchainException
     */
    public static BlockchainException transactionTimeout(String message, String txHash) {
        return new BlockchainException("TRANSACTION_TIMEOUT", message, txHash);
    }

    /**
     * Gas不足异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException insufficientGas(String message) {
        return new BlockchainException("INSUFFICIENT_GAS", message);
    }

    /**
     * 余额不足异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException insufficientBalance(String message) {
        return new BlockchainException("INSUFFICIENT_BALANCE", message);
    }

    /**
     * 合约调用失败异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException contractCallFailed(String message) {
        return new BlockchainException("CONTRACT_CALL_FAILED", message);
    }

    /**
     * 合约调用失败异常
     * 
     * @param message 错误消息
     * @param cause 原因
     * @return BlockchainException
     */
    public static BlockchainException contractCallFailed(String message, Throwable cause) {
        return new BlockchainException("CONTRACT_CALL_FAILED", message, cause);
    }

    /**
     * 网络错误异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException networkError(String message) {
        return new BlockchainException("NETWORK_ERROR", message);
    }

    /**
     * 网络错误异常
     * 
     * @param message 错误消息
     * @param cause 原因
     * @return BlockchainException
     */
    public static BlockchainException networkError(String message, Throwable cause) {
        return new BlockchainException("NETWORK_ERROR", message, cause);
    }

    /**
     * 节点同步异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException nodeSyncError(String message) {
        return new BlockchainException("NODE_SYNC_ERROR", message);
    }

    /**
     * 无效地址异常
     * 
     * @param address 无效地址
     * @return BlockchainException
     */
    public static BlockchainException invalidAddress(String address) {
        return new BlockchainException("INVALID_ADDRESS", "无效的以太坊地址: " + address);
    }

    /**
     * 无效交易哈希异常
     * 
     * @param txHash 无效交易哈希
     * @return BlockchainException
     */
    public static BlockchainException invalidTxHash(String txHash) {
        return new BlockchainException("INVALID_TX_HASH", "无效的交易哈希: " + txHash);
    }

    /**
     * 交易未找到异常
     * 
     * @param txHash 交易哈希
     * @return BlockchainException
     */
    public static BlockchainException transactionNotFound(String txHash) {
        return new BlockchainException("TRANSACTION_NOT_FOUND", "交易未找到: " + txHash, txHash);
    }

    /**
     * 区块未找到异常
     * 
     * @param blockNumber 区块号
     * @return BlockchainException
     */
    public static BlockchainException blockNotFound(Long blockNumber) {
        BlockchainException ex = new BlockchainException("BLOCK_NOT_FOUND", "区块未找到: " + blockNumber);
        ex.setBlockNumber(blockNumber);
        return ex;
    }

    /**
     * RPC调用失败异常
     * 
     * @param method RPC方法
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException rpcCallFailed(String method, String message) {
        return new BlockchainException("RPC_CALL_FAILED", 
            String.format("RPC调用失败 [%s]: %s", method, message));
    }

    /**
     * 配置错误异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException configError(String message) {
        return new BlockchainException("CONFIG_ERROR", message);
    }

    /**
     * 服务不可用异常
     * 
     * @param message 错误消息
     * @return BlockchainException
     */
    public static BlockchainException serviceUnavailable(String message) {
        return new BlockchainException("SERVICE_UNAVAILABLE", message);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("BlockchainException");
        
        if (errorCode != null) {
            sb.append("[").append(errorCode).append("]");
        }
        
        sb.append(": ").append(getMessage());
        
        if (txHash != null) {
            sb.append(" (txHash: ").append(txHash).append(")");
        }
        
        if (blockNumber != null) {
            sb.append(" (block: ").append(blockNumber).append(")");
        }
        
        return sb.toString();
    }
}