package com.webthree.batchtransfer.exception;

/**
 * 业务异常类
 * 用于处理业务逻辑相关的异常情况
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private String errorCode;

    /**
     * 构造函数
     * 
     * @param message 错误消息
     */
    public BusinessException(String message) {
        super(message);
    }

    /**
     * 构造函数
     * 
     * @param message 错误消息
     * @param cause 原因
     */
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * 构造函数
     * 
     * @param errorCode 错误码
     * @param message 错误消息
     */
    public BusinessException(String errorCode, String message) {
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
    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
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

    // 常用的业务异常静态方法

    /**
     * 参数无效异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException invalidParam(String message) {
        return new BusinessException("INVALID_PARAM", message);
    }

    /**
     * 资源不存在异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException notFound(String message) {
        return new BusinessException("NOT_FOUND", message);
    }

    /**
     * 状态错误异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException invalidStatus(String message) {
        return new BusinessException("INVALID_STATUS", message);
    }

    /**
     * 操作失败异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException operationFailed(String message) {
        return new BusinessException("OPERATION_FAILED", message);
    }

    /**
     * 数据冲突异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException dataConflict(String message) {
        return new BusinessException("DATA_CONFLICT", message);
    }

    /**
     * 权限不足异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException accessDenied(String message) {
        return new BusinessException("ACCESS_DENIED", message);
    }

    /**
     * 资源已存在异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException alreadyExists(String message) {
        return new BusinessException("ALREADY_EXISTS", message);
    }

    /**
     * 配置错误异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException configError(String message) {
        return new BusinessException("CONFIG_ERROR", message);
    }

    /**
     * 外部服务异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException externalServiceError(String message) {
        return new BusinessException("EXTERNAL_SERVICE_ERROR", message);
    }

    /**
     * 超时异常
     * 
     * @param message 错误消息
     * @return BusinessException
     */
    public static BusinessException timeout(String message) {
        return new BusinessException("TIMEOUT", message);
    }

    @Override
    public String toString() {
        if (errorCode != null) {
            return String.format("BusinessException[%s]: %s", errorCode, getMessage());
        }
        return super.toString();
    }
}