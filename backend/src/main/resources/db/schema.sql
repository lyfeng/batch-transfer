-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS batch_transfer 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE batch_transfer;

-- 批量转账任务表
CREATE TABLE IF NOT EXISTS batch_transfer_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    task_name VARCHAR(255) NOT NULL COMMENT '任务名称',
    total_recipients INT NOT NULL COMMENT '总接收地址数量',
    total_amount DECIMAL(28,18) NOT NULL COMMENT '总转账金额(ETH)',
    status VARCHAR(50) NOT NULL COMMENT '任务状态: PENDING, EXECUTING, COMPLETED, FAILED',
    tx_hash VARCHAR(255) NULL COMMENT '链上交易哈希',
    error_message TEXT NULL COMMENT '错误信息',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    
    INDEX idx_status_created (status, created_at),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_tx_hash (tx_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量转账任务表';

-- 批量转账项表
CREATE TABLE IF NOT EXISTS batch_transfer_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '项ID',
    task_id BIGINT NOT NULL COMMENT '关联的任务ID',
    recipient_address VARCHAR(255) NOT NULL COMMENT '接收地址',
    amount DECIMAL(28,18) NOT NULL COMMENT '转账金额(ETH)',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT '项状态: PENDING, SUCCESS, FAILED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_task_id (task_id),
    INDEX idx_recipient_address (recipient_address),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (task_id) REFERENCES batch_transfer_tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量转账项表';

-- 插入示例数据（可选）
-- INSERT INTO batch_transfer_tasks (task_name, total_recipients, total_amount, status) 
-- VALUES ('示例批量转账', 2, 0.15, 'PENDING');

-- INSERT INTO batch_transfer_items (task_id, recipient_address, amount, status) 
-- VALUES 
-- (1, '0x742d35Cc6634C0532925a3b8D4C819F3a8d9B9f0', 0.1, 'PENDING'),
-- (1, '0x8ba1f109551bD432803012645Hac136c5892c', 0.05, 'PENDING'); 