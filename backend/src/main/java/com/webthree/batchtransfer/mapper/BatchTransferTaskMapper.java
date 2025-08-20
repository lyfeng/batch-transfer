package com.webthree.batchtransfer.mapper;

import com.webthree.batchtransfer.entity.BatchTransferTask;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 批量转账任务Mapper接口
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
public interface BatchTransferTaskMapper {
    
    /**
     * 插入新任务
     * 
     * @param task 任务对象
     * @return 插入记录数
     */
    int insert(BatchTransferTask task);
    
    /**
     * 根据ID查询任务
     * 
     * @param id 任务ID
     * @return 任务对象
     */
    BatchTransferTask selectById(@Param("id") Long id);
    
    /**
     * 查询所有任务列表
     * 
     * @return 任务列表
     */
    List<BatchTransferTask> selectAll();
    
    /**
     * 根据状态查询任务列表
     * 
     * @param status 任务状态
     * @return 任务列表
     */
    List<BatchTransferTask> selectByStatus(@Param("status") BatchTransferTask.TaskStatus status);
    
    /**
     * 根据创建者地址查询任务列表
     * 
     * @param creatorAddress 创建者地址
     * @return 任务列表
     */
    List<BatchTransferTask> selectByCreatorAddress(@Param("creatorAddress") String creatorAddress);
    
    /**
     * 根据创建者地址和状态查询任务列表
     * 
     * @param creatorAddress 创建者地址
     * @param status 任务状态
     * @return 任务列表
     */
    List<BatchTransferTask> selectByCreatorAddressAndStatus(@Param("creatorAddress") String creatorAddress, 
                                                           @Param("status") BatchTransferTask.TaskStatus status);
    
    /**
     * 更新任务状态
     * 
     * @param id 任务ID
     * @param status 新状态
     * @param txHash 交易哈希
     * @param errorMessage 错误信息
     * @param executionToken 执行令牌
     * @param executionStartedAt 执行开始时间
     * @return 更新记录数
     */
    int updateStatus(@Param("id") Long id, 
                    @Param("status") BatchTransferTask.TaskStatus status,
                    @Param("txHash") String txHash,
                    @Param("errorMessage") String errorMessage,
                    @Param("executionToken") String executionToken,
                    @Param("executionStartedAt") LocalDateTime executionStartedAt);
    
    /**
     * 仅更新交易哈希
     * 
     * @param id 任务ID
     * @param txHash 交易哈希
     * @return 更新记录数
     */
    int updateTxHashOnly(@Param("id") Long id, @Param("txHash") String txHash);
    
    /**
     * 根据执行令牌查询任务
     * 
     * @param executionToken 执行令牌
     * @return 任务对象
     */
    BatchTransferTask selectByExecutionToken(@Param("executionToken") String executionToken);
    
    /**
     * 查询超时的执行中任务
     * 
     * @param timeoutMinutes 超时分钟数
     * @return 超时任务列表
     */
    List<BatchTransferTask> selectTimeoutExecutingTasks(@Param("timeoutMinutes") Integer timeoutMinutes);
    
    /**
     * 根据ID删除任务
     * 
     * @param id 任务ID
     * @return 删除记录数
     */
    int deleteById(@Param("id") Long id);
}