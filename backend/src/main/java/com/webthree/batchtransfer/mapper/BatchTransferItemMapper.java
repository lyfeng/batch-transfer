package com.webthree.batchtransfer.mapper;

import com.webthree.batchtransfer.entity.BatchTransferItem;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 批量转账项Mapper接口
 * 
 * @author WebThree Team
 * @since 1.0.0
 */
public interface BatchTransferItemMapper {
    
    /**
     * 批量插入转账项
     * 
     * @param items 转账项列表
     * @return 插入记录数
     */
    int batchInsert(@Param("items") List<BatchTransferItem> items);
    
    /**
     * 根据任务ID查询转账项列表
     * 
     * @param taskId 任务ID
     * @return 转账项列表
     */
    List<BatchTransferItem> selectByTaskId(@Param("taskId") Long taskId);
    
    /**
     * 根据任务ID删除转账项
     * 
     * @param taskId 任务ID
     * @return 删除记录数
     */
    int deleteByTaskId(@Param("taskId") Long taskId);
    
    /**
     * 更新转账项状态
     * 
     * @param id 项ID
     * @param status 状态
     * @return 更新记录数
     */
    int updateStatus(@Param("id") Long id, @Param("status") BatchTransferItem.ItemStatus status);
}