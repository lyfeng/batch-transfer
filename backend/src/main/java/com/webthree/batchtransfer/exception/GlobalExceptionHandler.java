package com.webthree.batchtransfer.exception;

import com.webthree.batchtransfer.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 全局异常处理器
 * 统一处理应用中的各种异常，返回标准的API响应格式
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理参数验证异常（@Valid注解）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
        
        log.warn("Validation failed: {}", ex.getMessage());
        
        List<String> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }
        
        String message = "参数验证失败: " + String.join(", ", errors);
        return ResponseEntity.badRequest().body(ApiResponse.paramError(message));
    }

    /**
     * 处理绑定异常
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Object>> handleBindException(BindException ex) {
        
        log.warn("Bind exception: {}", ex.getMessage());
        
        List<String> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }
        
        String message = "参数绑定失败: " + String.join(", ", errors);
        return ResponseEntity.badRequest().body(ApiResponse.paramError(message));
    }

    /**
     * 处理约束违反异常（@Validated注解）
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            ConstraintViolationException ex) {
        
        log.warn("Constraint violation: {}", ex.getMessage());
        
        List<String> errors = new ArrayList<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        
        for (ConstraintViolation<?> violation : violations) {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            errors.add(propertyPath + ": " + message);
        }
        
        String message = "参数约束违反: " + String.join(", ", errors);
        return ResponseEntity.badRequest().body(ApiResponse.paramError(message));
    }

    /**
     * 处理缺少请求参数异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex) {
        
        log.warn("Missing request parameter: {}", ex.getMessage());
        
        String message = "缺少必需的请求参数: " + ex.getParameterName();
        return ResponseEntity.badRequest().body(ApiResponse.paramError(message));
    }

    /**
     * 处理方法参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        
        log.warn("Method argument type mismatch: {}", ex.getMessage());
        
        String message = String.format("参数类型错误: %s 应该是 %s 类型", 
            ex.getName(), ex.getRequiredType().getSimpleName());
        return ResponseEntity.badRequest().body(ApiResponse.paramError(message));
    }

    /**
     * 处理HTTP消息不可读异常（JSON格式错误等）
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {
        
        log.warn("HTTP message not readable: {}", ex.getMessage());
        
        String message = "请求体格式错误，请检查JSON格式";
        return ResponseEntity.badRequest().body(ApiResponse.paramError(message));
    }

    /**
     * 处理HTTP请求方法不支持异常
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        
        log.warn("HTTP method not supported: {}", ex.getMessage());
        
        String message = String.format("不支持的HTTP方法: %s", ex.getMethod());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
            .body(ApiResponse.fail(405, message));
    }

    /**
     * 处理404异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNoHandlerFound(
            NoHandlerFoundException ex) {
        
        log.warn("No handler found: {}", ex.getMessage());
        
        String message = String.format("请求的资源不存在: %s %s", 
            ex.getHttpMethod(), ex.getRequestURL());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.notFound(message));
    }

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(
            BusinessException ex) {
        
        log.warn("Business exception: {}", ex.getMessage());
        
        return ResponseEntity.badRequest().body(
            ApiResponse.businessError(ex.getMessage())
        );
    }

    /**
     * 处理区块链相关异常
     */
    @ExceptionHandler(BlockchainException.class)
    public ResponseEntity<ApiResponse<Object>> handleBlockchainException(
            BlockchainException ex) {
        
        log.error("Blockchain exception: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ApiResponse.fail(503, "区块链服务异常: " + ex.getMessage()));
    }

    /**
     * 处理非法参数异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(
            IllegalArgumentException ex) {
        
        log.warn("Illegal argument: {}", ex.getMessage());
        
        return ResponseEntity.badRequest().body(
            ApiResponse.paramError("参数错误: " + ex.getMessage())
        );
    }

    /**
     * 处理非法状态异常
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalState(
            IllegalStateException ex) {
        
        log.warn("Illegal state: {}", ex.getMessage());
        
        return ResponseEntity.badRequest().body(
            ApiResponse.businessError("状态错误: " + ex.getMessage())
        );
    }

    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(
            RuntimeException ex) {
        
        log.error("Runtime exception: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(500, "系统运行时异常: " + ex.getMessage()));
    }

    /**
     * 处理所有其他异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex) {
        
        log.error("Unexpected exception: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(500, "系统内部错误，请联系管理员"));
    }

    /**
     * 处理空指针异常
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiResponse<Object>> handleNullPointer(
            NullPointerException ex) {
        
        log.error("Null pointer exception: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(500, "系统内部错误：空指针异常"));
    }

    /**
     * 处理数组越界异常
     */
    @ExceptionHandler(IndexOutOfBoundsException.class)
    public ResponseEntity<ApiResponse<Object>> handleIndexOutOfBounds(
            IndexOutOfBoundsException ex) {
        
        log.error("Index out of bounds: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(500, "系统内部错误：数组越界"));
    }

    /**
     * 处理数字格式异常
     */
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<ApiResponse<Object>> handleNumberFormat(
            NumberFormatException ex) {
        
        log.warn("Number format exception: {}", ex.getMessage());
        
        return ResponseEntity.badRequest().body(
            ApiResponse.paramError("数字格式错误: " + ex.getMessage())
        );
    }

    /**
     * 处理类型转换异常
     */
    @ExceptionHandler(ClassCastException.class)
    public ResponseEntity<ApiResponse<Object>> handleClassCast(
            ClassCastException ex) {
        
        log.error("Class cast exception: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(500, "系统内部错误：类型转换异常"));
    }
}