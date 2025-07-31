package com.webthree.batchtransfer.controller;

import com.webthree.batchtransfer.dto.ApiResponse;
import com.webthree.batchtransfer.dto.CreateTaskRequest;
import com.webthree.batchtransfer.dto.TaskResponse;
import com.webthree.batchtransfer.dto.UpdateTaskStatusRequest;
import com.webthree.batchtransfer.entity.BatchTransferTask;
import com.webthree.batchtransfer.service.BatchTransferService;
import com.webthree.batchtransfer.service.BlockchainMonitorService;
import com.webthree.batchtransfer.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 批量转账控制器
 * 提供批量转账相关的REST API接口
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/batch-transfer")
@RequiredArgsConstructor
@Validated
@Tag(name = "批量转账", description = "ETH批量转账相关接口")
public class BatchTransferController {

    private final BatchTransferService batchTransferService;
    private final BlockchainMonitorService blockchainMonitorService;

    /**
     * 创建批量转账任务
     * 
     * @param request 创建任务请求
     * @return 创建的任务信息
     */
    @PostMapping("/tasks")
    @Operation(summary = "创建批量转账任务", description = "创建一个新的批量转账任务")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request) {
        
        log.info("Creating batch transfer task: {}", request.getTaskName());
        
        try {
            // 从认证信息中获取当前用户的钱包地址
            String currentWalletAddress = AuthUtils.requireCurrentWalletAddress();
            
            TaskResponse task = batchTransferService.createTask(request, currentWalletAddress);
            log.info("Successfully created task with ID: {} for wallet: {}", task.getId(), currentWalletAddress);
            
            return ResponseEntity.ok(ApiResponse.success(task));
        } catch (Exception e) {
            log.error("Failed to create batch transfer task", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("创建任务失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取任务详情
     * 
     * @param taskId 任务ID
     * @return 任务详情
     */
    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "获取任务详情", description = "根据任务ID获取批量转账任务的详细信息")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        
        log.info("Getting task details for ID: {}", taskId);
        
        try {
            TaskResponse task = batchTransferService.getTaskById(taskId);
            return ResponseEntity.ok(ApiResponse.success(task));
        } catch (Exception e) {
            log.error("Failed to get task details for ID: {}", taskId, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("获取任务详情失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取任务列表
     * 
     * @param status 任务状态过滤
     * @return 任务列表
     */
    @GetMapping("/tasks")
    @Operation(summary = "获取任务列表", description = "获取当前用户的批量转账任务列表")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks(
            @Parameter(description = "任务状态过滤") 
            @RequestParam(required = false) BatchTransferTask.TaskStatus status) {
        
        try {
            // 从认证信息中获取当前用户的钱包地址
            String currentWalletAddress = AuthUtils.requireCurrentWalletAddress();
            
            log.info("Getting tasks list for wallet: {}, status: {}", currentWalletAddress, status);
            
            List<TaskResponse> tasks;
            
            if (status != null) {
                // 按当前用户地址和状态过滤
                tasks = batchTransferService.getTasksByCreatorAddressAndStatus(currentWalletAddress, status);
            } else {
                // 获取当前用户的所有任务
                tasks = batchTransferService.getTasksByCreatorAddress(currentWalletAddress);
            }
            
            return ResponseEntity.ok(ApiResponse.success(tasks));
        } catch (Exception e) {
            log.error("Failed to get tasks list", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("获取任务列表失败: " + e.getMessage())
            );
        }
    }

    /**
     * 更新任务状态
     * 
     * @param taskId 任务ID
     * @param request 更新请求
     * @return 更新结果
     */
    @PutMapping("/tasks/{taskId}/status")
    @Operation(summary = "更新任务状态", description = "更新批量转账任务的状态信息")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @Parameter(description = "任务ID") @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        
        log.info("Updating task status for ID: {}, new status: {}", taskId, request.getStatus());
        
        try {
            TaskResponse updatedTask = batchTransferService.updateTaskStatus(taskId, request);
            return ResponseEntity.ok(ApiResponse.success(updatedTask));
        } catch (Exception e) {
            log.error("Failed to update task status for ID: {}", taskId, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("更新任务状态失败: " + e.getMessage())
            );
        }
    }

    /**
     * 删除任务
     * 
     * @param taskId 任务ID
     * @return 删除结果
     */
    @DeleteMapping("/tasks/{taskId}")
    @Operation(summary = "删除任务", description = "删除指定的批量转账任务")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        
        log.info("Deleting task with ID: {}", taskId);
        
        try {
            batchTransferService.deleteTask(taskId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("Failed to delete task with ID: {}", taskId, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("删除任务失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取任务统计信息
     * 
     * @return 统计信息
     */
    @GetMapping("/tasks/statistics")
    @Operation(summary = "获取任务统计", description = "获取当前用户的批量转账任务统计信息")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTaskStatistics() {
        
        try {
            // 从认证信息中获取当前用户的钱包地址
            String currentWalletAddress = AuthUtils.requireCurrentWalletAddress();
            
            log.info("Getting task statistics for wallet: {}", currentWalletAddress);
            
            // 获取当前用户的任务列表
            List<TaskResponse> userTasks = batchTransferService.getTasksByCreatorAddress(currentWalletAddress);
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalTasks", userTasks.size());
            statistics.put("pendingTasks", userTasks.stream().filter(t -> t.getStatus() == BatchTransferTask.TaskStatus.PENDING).count());
            statistics.put("executingTasks", userTasks.stream().filter(t -> t.getStatus() == BatchTransferTask.TaskStatus.EXECUTING).count());
            statistics.put("completedTasks", userTasks.stream().filter(t -> t.getStatus() == BatchTransferTask.TaskStatus.COMPLETED).count());
            statistics.put("failedTasks", userTasks.stream().filter(t -> t.getStatus() == BatchTransferTask.TaskStatus.FAILED).count());
            
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            log.error("Failed to get task statistics", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("获取统计信息失败: " + e.getMessage())
            );
        }
    }

    /**
     * 手动检查任务状态
     * 
     * @param taskId 任务ID
     * @return 检查结果
     */
    @PostMapping("/tasks/{taskId}/check-status")
    @Operation(summary = "手动检查任务状态", description = "手动触发检查指定任务在区块链上的状态")
    public ResponseEntity<ApiResponse<Void>> checkTaskStatus(
            @Parameter(description = "任务ID") @PathVariable Long taskId) {
        
        log.info("Manually checking task status for ID: {}", taskId);
        
        try {
            blockchainMonitorService.checkTaskStatus(taskId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Failed to check task status for ID: {}", taskId, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("检查任务状态失败: " + e.getMessage())
            );
        }
    }

    /**
     * 获取区块链监听服务状态
     * 
     * @return 服务状态信息
     */
    @GetMapping("/monitor/status")
    @Operation(summary = "获取监听服务状态", description = "获取区块链监听服务的运行状态")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonitorStatus() {
        
        log.info("Getting blockchain monitor status");
        
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("connected", blockchainMonitorService.isWeb3jConnected());
            status.put("currentBlock", blockchainMonitorService.getCurrentBlockNumber());
            status.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(ApiResponse.success(status));
        } catch (Exception e) {
            log.error("Failed to get monitor status", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("获取监听服务状态失败: " + e.getMessage())
            );
        }
    }

    /**
     * 重启区块链监听服务
     * 
     * @return 重启结果
     */
    @PostMapping("/monitor/restart")
    @Operation(summary = "重启监听服务", description = "重启区块链监听服务")
    public ResponseEntity<ApiResponse<Void>> restartMonitor() {
        
        log.info("Restarting blockchain monitor service");
        
        try {
            // 这里可以添加重启监听服务的逻辑
            // blockchainMonitorService.restart();
            
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Failed to restart monitor service", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("重启监听服务失败: " + e.getMessage())
            );
        }
    }

    /**
     * 健康检查接口
     * 
     * @return 健康状态
     */
    @GetMapping("/health")
    @Operation(summary = "健康检查", description = "检查批量转账服务的健康状态")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        
        try {
            Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis(),
                "service", "batch-transfer",
                "version", "1.0.0"
            );
            
            return ResponseEntity.ok(ApiResponse.success(health));
        } catch (Exception e) {
            log.error("Health check failed", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.businessError("健康检查失败: " + e.getMessage())
            );
        }
    }
}