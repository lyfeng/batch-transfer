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
    creator_address VARCHAR(42) NOT NULL COMMENT '创建者钱包地址',
    execution_token VARCHAR(64) NULL UNIQUE COMMENT '执行令牌，防止重复执行',
    execution_started_at TIMESTAMP NULL COMMENT '执行开始时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_status_created (status, created_at),
    INDEX idx_creator_address (creator_address),
    INDEX idx_creator_status (creator_address, status),
    INDEX idx_execution_token (execution_token),
    INDEX idx_execution_started (execution_started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量转账任务表';

-- 创建批量转账项表
CREATE TABLE IF NOT EXISTS batch_transfer_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '项ID',
    task_id BIGINT NOT NULL COMMENT '关联任务ID',
    recipient_address VARCHAR(42) NOT NULL COMMENT '接收地址',
    amount DECIMAL(36, 18) NOT NULL COMMENT '转账金额（ETH）',
    status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '项状态',
    tx_hash VARCHAR(66) COMMENT '交易哈希（与任务共享）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_task_id (task_id),
    INDEX idx_recipient_address (recipient_address),
    INDEX idx_status (status),
    INDEX idx_task_status (task_id, status),
    INDEX idx_tx_hash (tx_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批量转账项表';
