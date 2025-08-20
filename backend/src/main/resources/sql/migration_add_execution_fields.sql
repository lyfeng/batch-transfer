-- 数据库迁移脚本：添加执行令牌相关字段
-- 执行时间：2024年

USE batch_transfer;

-- 为 batch_transfer_task 表添加执行令牌相关字段
ALTER TABLE batch_transfer_task 
ADD COLUMN execution_token VARCHAR(64) NULL UNIQUE COMMENT '执行令牌，防止重复执行' AFTER creator_address,
ADD COLUMN execution_started_at TIMESTAMP NULL COMMENT '执行开始时间' AFTER execution_token;

-- 添加索引
ALTER TABLE batch_transfer_task 
ADD INDEX idx_execution_token (execution_token),
ADD INDEX idx_execution_started (execution_started_at);

-- 验证表结构
DESCRIBE batch_transfer_task;

-- 显示添加的字段
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'batch_transfer' 
    AND TABLE_NAME = 'batch_transfer_task'
    AND COLUMN_NAME IN ('execution_token', 'execution_started_at')
ORDER BY ORDINAL_POSITION;