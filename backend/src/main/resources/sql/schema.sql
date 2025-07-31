-- 批量转账系统数据库初始化脚本
-- 创建数据库和表结构

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS batch_transfer 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE batch_transfer;

-- 创建批量转账任务表
CREATE TABLE IF NOT EXISTS batch_transfer_task (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    task_name VARCHAR(255) NOT NULL COMMENT '任务名称',
    recipient_count INT NOT NULL DEFAULT 0 COMMENT '接收地址数量',
    total_amount DECIMAL(36, 18) NOT NULL DEFAULT 0 COMMENT '总转账金额（ETH）',
    status ENUM('PENDING', 'EXECUTING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '任务状态',
    tx_hash VARCHAR(66) NULL COMMENT '交易哈希',
    error_message TEXT NULL COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量转账任务表';

-- 创建批量转账项表
CREATE TABLE IF NOT EXISTS batch_transfer_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '项ID',
    task_id BIGINT NOT NULL COMMENT '关联任务ID',
    recipient_address VARCHAR(42) NOT NULL COMMENT '接收地址',
    amount DECIMAL(36, 18) NOT NULL COMMENT '转账金额（ETH）',
    status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '项状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (task_id) REFERENCES batch_transfer_task(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_recipient_address (recipient_address),
    INDEX idx_status (status),
    INDEX idx_task_status (task_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量转账项表';

-- 创建系统配置表（可选）
CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT NOT NULL COMMENT '配置值',
    description VARCHAR(500) NULL COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 创建操作日志表（可选）
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_desc VARCHAR(500) NOT NULL COMMENT '操作描述',
    task_id BIGINT NULL COMMENT '关联任务ID',
    operator VARCHAR(100) NULL COMMENT '操作者',
    ip_address VARCHAR(45) NULL COMMENT 'IP地址',
    user_agent VARCHAR(500) NULL COMMENT '用户代理',
    request_params TEXT NULL COMMENT '请求参数',
    response_result TEXT NULL COMMENT '响应结果',
    execution_time INT NULL COMMENT '执行时间（毫秒）',
    status ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS' COMMENT '操作状态',
    error_message TEXT NULL COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_operation_type (operation_type),
    INDEX idx_task_id (task_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 创建区块链监听状态表（可选）
CREATE TABLE IF NOT EXISTS blockchain_monitor_state (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '状态ID',
    network_name VARCHAR(50) NOT NULL COMMENT '网络名称',
    contract_address VARCHAR(42) NOT NULL COMMENT '合约地址',
    last_processed_block BIGINT NOT NULL DEFAULT 0 COMMENT '最后处理的区块号',
    last_processed_time TIMESTAMP NULL COMMENT '最后处理时间',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    UNIQUE KEY uk_network_contract (network_name, contract_address),
    INDEX idx_last_processed_block (last_processed_block),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='区块链监听状态表';

-- 插入默认系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES 
('max_recipients_per_task', '100', '单个任务最大接收者数量'),
('min_transfer_amount', '0.001', '最小转账金额（ETH）'),
('max_transfer_amount', '100', '最大转账金额（ETH）'),
('max_total_amount_per_task', '1000', '单个任务最大总金额（ETH）'),
('default_gas_price', '20', '默认Gas价格（Gwei）'),
('default_gas_limit', '21000', '默认Gas限制'),
('confirmation_blocks', '12', '确认所需区块数'),
('task_timeout_minutes', '60', '任务超时时间（分钟）'),
('monitor_interval_seconds', '30', '监听间隔（秒）'),
('cleanup_completed_tasks_days', '30', '清理已完成任务天数'),
('cleanup_failed_tasks_days', '7', '清理失败任务天数')
ON DUPLICATE KEY UPDATE 
config_value = VALUES(config_value),
updated_at = CURRENT_TIMESTAMP;

-- 创建视图：任务统计
CREATE OR REPLACE VIEW v_task_statistics AS
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN status = 'EXECUTING' THEN 1 END) as executing_tasks,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_tasks,
    SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END) as total_completed_amount,
    SUM(CASE WHEN status = 'COMPLETED' THEN recipient_count ELSE 0 END) as total_completed_recipients,
    AVG(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE NULL END) as avg_completed_amount,
    MIN(created_at) as first_task_time,
    MAX(created_at) as last_task_time
FROM batch_transfer_task;

-- 创建视图：今日任务统计
CREATE OR REPLACE VIEW v_daily_task_statistics AS
SELECT 
    DATE(created_at) as task_date,
    COUNT(*) as daily_total_tasks,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as daily_completed_tasks,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as daily_failed_tasks,
    SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END) as daily_completed_amount,
    SUM(CASE WHEN status = 'COMPLETED' THEN recipient_count ELSE 0 END) as daily_completed_recipients
FROM batch_transfer_task
WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY task_date DESC;

-- 创建存储过程：清理过期任务
DELIMITER //
CREATE PROCEDURE CleanupExpiredTasks()
BEGIN
    DECLARE completed_days INT DEFAULT 30;
    DECLARE failed_days INT DEFAULT 7;
    DECLARE deleted_completed INT DEFAULT 0;
    DECLARE deleted_failed INT DEFAULT 0;
    
    -- 获取配置的清理天数
    SELECT CAST(config_value AS UNSIGNED) INTO completed_days 
    FROM system_config 
    WHERE config_key = 'cleanup_completed_tasks_days' 
    LIMIT 1;
    
    SELECT CAST(config_value AS UNSIGNED) INTO failed_days 
    FROM system_config 
    WHERE config_key = 'cleanup_failed_tasks_days' 
    LIMIT 1;
    
    -- 删除过期的已完成任务
    DELETE FROM batch_transfer_task 
    WHERE status = 'COMPLETED' 
    AND created_at < DATE_SUB(NOW(), INTERVAL completed_days DAY);
    
    SET deleted_completed = ROW_COUNT();
    
    -- 删除过期的失败任务
    DELETE FROM batch_transfer_task 
    WHERE status = 'FAILED' 
    AND created_at < DATE_SUB(NOW(), INTERVAL failed_days DAY);
    
    SET deleted_failed = ROW_COUNT();
    
    -- 记录清理日志
    INSERT INTO operation_log (
        operation_type, 
        operation_desc, 
        operator, 
        request_params, 
        response_result, 
        status
    ) VALUES (
        'CLEANUP_TASKS',
        '清理过期任务',
        'SYSTEM',
        CONCAT('completed_days:', completed_days, ', failed_days:', failed_days),
        CONCAT('deleted_completed:', deleted_completed, ', deleted_failed:', deleted_failed),
        'SUCCESS'
    );
    
    SELECT deleted_completed, deleted_failed;
END //
DELIMITER ;

-- 创建存储过程：获取任务详细统计
DELIMITER //
CREATE PROCEDURE GetTaskDetailStatistics(
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        DATE(t.created_at) as date,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN t.status = 'PENDING' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN t.status = 'EXECUTING' THEN 1 END) as executing_tasks,
        COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.status = 'FAILED' THEN 1 END) as failed_tasks,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN t.total_amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN t.recipient_count ELSE 0 END) as completed_recipients,
        AVG(CASE WHEN t.status = 'COMPLETED' THEN t.total_amount ELSE NULL END) as avg_amount,
        MIN(t.created_at) as first_task,
        MAX(t.updated_at) as last_update
    FROM batch_transfer_task t
    WHERE DATE(t.created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(t.created_at)
    ORDER BY date DESC;
END //
DELIMITER ;

-- 创建触发器：更新任务统计
DELIMITER //
CREATE TRIGGER tr_update_task_recipient_count 
AFTER INSERT ON batch_transfer_item
FOR EACH ROW
BEGIN
    UPDATE batch_transfer_task 
    SET 
        recipient_count = (
            SELECT COUNT(*) 
            FROM batch_transfer_item 
            WHERE task_id = NEW.task_id
        ),
        total_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM batch_transfer_item 
            WHERE task_id = NEW.task_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.task_id;
END //
DELIMITER ;

-- 创建触发器：删除项时更新任务统计
DELIMITER //
CREATE TRIGGER tr_update_task_on_item_delete 
AFTER DELETE ON batch_transfer_item
FOR EACH ROW
BEGIN
    UPDATE batch_transfer_task 
    SET 
        recipient_count = (
            SELECT COUNT(*) 
            FROM batch_transfer_item 
            WHERE task_id = OLD.task_id
        ),
        total_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM batch_transfer_item 
            WHERE task_id = OLD.task_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.task_id;
END //
DELIMITER ;

-- 创建索引优化查询性能
CREATE INDEX idx_task_status_created ON batch_transfer_task(status, created_at DESC);
CREATE INDEX idx_task_updated_at ON batch_transfer_task(updated_at DESC);
CREATE INDEX idx_item_task_status ON batch_transfer_item(task_id, status);
CREATE INDEX idx_operation_log_type_time ON operation_log(operation_type, created_at DESC);

-- 创建开发环境数据库
CREATE DATABASE IF NOT EXISTS batch_transfer_dev 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 授权用户（根据需要调整）
-- CREATE USER IF NOT EXISTS 'batch_transfer'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON batch_transfer.* TO 'batch_transfer'@'%';
-- GRANT ALL PRIVILEGES ON batch_transfer_dev.* TO 'batch_transfer'@'%';
-- FLUSH PRIVILEGES;

-- 显示创建的表
SHOW TABLES;

-- 显示表结构
DESCRIBE batch_transfer_task;
DESCRIBE batch_transfer_item;

-- 显示统计信息
SELECT * FROM v_task_statistics;

SELECT 'Database schema created successfully!' as message;