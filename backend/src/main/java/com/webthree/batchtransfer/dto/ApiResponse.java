package com.webthree.batchtransfer.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 通用API响应DTO
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    /**
     * 响应代码
     */
    private int code;
    
    /**
     * 响应消息
     */
    private String message;
    
    /**
     * 响应数据
     */
    private T data;
    
    /**
     * 请求是否成功
     */
    private boolean success;
    
    /**
     * 创建成功响应
     * 
     * @param data 响应数据
     * @param <T> 数据类型
     * @return 成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<T>(200, "success", data, true);
    }
    
    /**
     * 创建成功响应（无数据）
     * 
     * @return 成功响应
     */
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<T>(200, "success", null, true);
    }
    
    /**
     * 创建业务错误响应
     * 
     * @param message 错误消息
     * @return 错误响应
     */
    public static <T> ApiResponse<T> businessError(String message) {
        return new ApiResponse<T>(400, message, null, false);
    }
    
    /**
     * 创建未找到响应
     * 
     * @param message 错误消息
     * @return 未找到响应
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<T>(404, message, null, false);
    }
    
    /**
     * 创建服务器错误响应
     * 
     * @param message 错误消息
     * @return 服务器错误响应
     */
    public static <T> ApiResponse<T> serverError(String message) {
        return new ApiResponse<T>(500, message, null, false);
    }
    
    /**
     * 创建参数错误响应
     * 
     * @param message 错误消息
     * @return 参数错误响应
     */
    public static <T> ApiResponse<T> paramError(String message) {
        return new ApiResponse<T>(400, message, null, false);
    }
    
    /**
     * 创建失败响应
     * 
     * @param code 错误代码
     * @param message 错误消息
     * @return 失败响应
     */
    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<T>(code, message, null, false);
    }
}