package com.webthree.batchtransfer.mapper;

import com.webthree.batchtransfer.entity.BatchTransferTask;
import org.apache.ibatis.annotations.Param;

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
     * 更新任务状态
     * 
     * @param id 任务ID
     * @param status 新状态
     * @param txHash 交易哈希
     * @param errorMessage 错误信息
     * @return 更新记录数
     */
    int updateStatus(@Param("id") Long id, 
                    @Param("status") BatchTransferTask.TaskStatus status,
                    @Param("txHash") String txHash,
                    @Param("errorMessage") String errorMessage);
    
    /**
     * 根据ID删除任务
     * 
     * @param id 任务ID
     * @return 删除记录数
     */
    int deleteById(@Param("id") Long id);
}