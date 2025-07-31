-- 批量转账系统测试数据脚本
-- 用于开发和测试环境

USE batch_transfer_dev;

-- 清理现有测试数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE batch_transfer_item;
TRUNCATE TABLE batch_transfer_task;
TRUNCATE TABLE operation_log;
TRUNCATE TABLE blockchain_monitor_state;
SET FOREIGN_KEY_CHECKS = 1;

-- 插入测试任务数据
INSERT INTO batch_transfer_task (
    id, task_name, recipient_count, total_amount, status, tx_hash, error_message, created_at, updated_at
) VALUES 
-- 已完成的任务
(1, '测试批量转账-1', 3, 0.150000000000000000, 'COMPLETED', 
 '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 
 NULL, '2024-01-15 10:00:00', '2024-01-15 10:05:00'),

(2, '工资发放-2024年1月', 5, 2.500000000000000000, 'COMPLETED', 
 '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef1', 
 NULL, '2024-01-16 14:30:00', '2024-01-16 14:35:00'),

(3, '奖金发放-Q4', 2, 1.000000000000000000, 'COMPLETED', 
 '0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef12', 
 NULL, '2024-01-17 09:15:00', '2024-01-17 09:20:00'),

-- 执行中的任务
(4, '月度分红发放', 4, 3.200000000000000000, 'EXECUTING', 
 '0x4567890123def1234567890123def1234567890123def1234567890123def123', 
 NULL, '2024-01-18 16:45:00', '2024-01-18 16:50:00'),

-- 待执行的任务
(5, '团队激励发放', 6, 1.800000000000000000, 'PENDING', 
 NULL, NULL, '2024-01-19 11:20:00', '2024-01-19 11:20:00'),

(6, '项目奖励发放', 3, 0.900000000000000000, 'PENDING', 
 NULL, NULL, '2024-01-19 15:30:00', '2024-01-19 15:30:00'),

-- 失败的任务
(7, '测试失败任务', 2, 0.200000000000000000, 'FAILED', 
 NULL, 'Gas estimation failed: insufficient funds', 
 '2024-01-18 08:00:00', '2024-01-18 08:05:00'),

(8, '大额转账测试', 10, 50.000000000000000000, 'FAILED', 
 NULL, 'Transaction reverted: exceeds maximum transfer limit', 
 '2024-01-17 20:00:00', '2024-01-17 20:10:00');

-- 插入测试转账项数据
INSERT INTO batch_transfer_item (
    task_id, recipient_address, amount, status, created_at
) VALUES 
-- 任务1的转账项（已完成）
(1, '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1', 0.050000000000000000, 'SUCCESS', '2024-01-15 10:00:00'),
(1, '0x8ba1f109551bD432803012645Hac136c5C1b4d8b', 0.050000000000000000, 'SUCCESS', '2024-01-15 10:00:00'),
(1, '0x9Ac64Cc6634C0532925a3b8D4C9db96C4b4d8b2', 0.050000000000000000, 'SUCCESS', '2024-01-15 10:00:00'),

-- 任务2的转账项（已完成）
(2, '0xA1b2C3d4E5f6789012345678901234567890Ab1', 0.500000000000000000, 'SUCCESS', '2024-01-16 14:30:00'),
(2, '0xB2c3D4e5F6789012345678901234567890Bc2', 0.500000000000000000, 'SUCCESS', '2024-01-16 14:30:00'),
(2, '0xC3d4E5f6789012345678901234567890Cd3', 0.500000000000000000, 'SUCCESS', '2024-01-16 14:30:00'),
(2, '0xD4e5F6789012345678901234567890De4', 0.500000000000000000, 'SUCCESS', '2024-01-16 14:30:00'),
(2, '0xE5f6789012345678901234567890Ef5', 0.500000000000000000, 'SUCCESS', '2024-01-16 14:30:00'),

-- 任务3的转账项（已完成）
(3, '0xF6789012345678901234567890Fg6', 0.600000000000000000, 'SUCCESS', '2024-01-17 09:15:00'),
(3, '0x1234567890123456789012345678901234567890', 0.400000000000000000, 'SUCCESS', '2024-01-17 09:15:00'),

-- 任务4的转账项（执行中）
(4, '0x2345678901234567890123456789012345678901', 0.800000000000000000, 'PENDING', '2024-01-18 16:45:00'),
(4, '0x3456789012345678901234567890123456789012', 0.800000000000000000, 'PENDING', '2024-01-18 16:45:00'),
(4, '0x4567890123456789012345678901234567890123', 0.800000000000000000, 'PENDING', '2024-01-18 16:45:00'),
(4, '0x5678901234567890123456789012345678901234', 0.800000000000000000, 'PENDING', '2024-01-18 16:45:00'),

-- 任务5的转账项（待执行）
(5, '0x6789012345678901234567890123456789012345', 0.300000000000000000, 'PENDING', '2024-01-19 11:20:00'),
(5, '0x7890123456789012345678901234567890123456', 0.300000000000000000, 'PENDING', '2024-01-19 11:20:00'),
(5, '0x8901234567890123456789012345678901234567', 0.300000000000000000, 'PENDING', '2024-01-19 11:20:00'),
(5, '0x9012345678901234567890123456789012345678', 0.300000000000000000, 'PENDING', '2024-01-19 11:20:00'),
(5, '0xa123456789012345678901234567890123456789', 0.300000000000000000, 'PENDING', '2024-01-19 11:20:00'),
(5, '0xb234567890123456789012345678901234567890', 0.300000000000000000, 'PENDING', '2024-01-19 11:20:00'),

-- 任务6的转账项（待执行）
(6, '0xc345678901234567890123456789012345678901', 0.300000000000000000, 'PENDING', '2024-01-19 15:30:00'),
(6, '0xd456789012345678901234567890123456789012', 0.300000000000000000, 'PENDING', '2024-01-19 15:30:00'),
(6, '0xe567890123456789012345678901234567890123', 0.300000000000000000, 'PENDING', '2024-01-19 15:30:00'),

-- 任务7的转账项（失败）
(7, '0xf678901234567890123456789012345678901234', 0.100000000000000000, 'FAILED', '2024-01-18 08:00:00'),
(7, '0x1789012345678901234567890123456789012345', 0.100000000000000000, 'FAILED', '2024-01-18 08:00:00'),

-- 任务8的转账项（失败）
(8, '0x2890123456789012345678901234567890123456', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x3901234567890123456789012345678901234567', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x4012345678901234567890123456789012345678', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x5123456789012345678901234567890123456789', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x6234567890123456789012345678901234567890', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x7345678901234567890123456789012345678901', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x8456789012345678901234567890123456789012', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0x9567890123456789012345678901234567890123', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0xa678901234567890123456789012345678901234', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00'),
(8, '0xb789012345678901234567890123456789012345', 5.000000000000000000, 'FAILED', '2024-01-17 20:00:00');

-- 插入操作日志测试数据
INSERT INTO operation_log (
    operation_type, operation_desc, task_id, operator, ip_address, 
    user_agent, request_params, response_result, execution_time, 
    status, error_message, created_at
) VALUES 
('CREATE_TASK', '创建批量转账任务', 1, 'admin', '192.168.1.100', 
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 '{"taskName":"测试批量转账-1","recipients":3}', 
 '{"taskId":1,"status":"success"}', 150, 'SUCCESS', NULL, '2024-01-15 10:00:00'),

('UPDATE_TASK_STATUS', '更新任务状态为执行中', 1, 'system', '127.0.0.1', 
 'BatchTransferSystem/1.0', 
 '{"taskId":1,"status":"EXECUTING","txHash":"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"}', 
 '{"updated":true}', 50, 'SUCCESS', NULL, '2024-01-15 10:02:00'),

('UPDATE_TASK_STATUS', '更新任务状态为已完成', 1, 'system', '127.0.0.1', 
 'BatchTransferSystem/1.0', 
 '{"taskId":1,"status":"COMPLETED"}', 
 '{"updated":true}', 30, 'SUCCESS', NULL, '2024-01-15 10:05:00'),

('CREATE_TASK', '创建工资发放任务', 2, 'hr_manager', '192.168.1.101', 
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 '{"taskName":"工资发放-2024年1月","recipients":5}', 
 '{"taskId":2,"status":"success"}', 200, 'SUCCESS', NULL, '2024-01-16 14:30:00'),

('CREATE_TASK', '创建失败任务', 7, 'test_user', '192.168.1.102', 
 'PostmanRuntime/7.32.3', 
 '{"taskName":"测试失败任务","recipients":2}', 
 '{"error":"insufficient_funds"}', 100, 'FAILED', 
 'Gas estimation failed: insufficient funds', '2024-01-18 08:00:00'),

('CHECK_TASK_STATUS', '手动检查任务状态', 4, 'admin', '192.168.1.100', 
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 '{"taskId":4}', 
 '{"status":"EXECUTING","txHash":"0x4567890123def1234567890123def1234567890123def1234567890123def123"}', 
 80, 'SUCCESS', NULL, '2024-01-18 16:50:00'),

('CLEANUP_TASKS', '清理过期任务', NULL, 'SYSTEM', '127.0.0.1', 
 'ScheduledTask/1.0', 
 '{"completed_days":30,"failed_days":7}', 
 '{"deleted_completed":0,"deleted_failed":0}', 500, 'SUCCESS', NULL, '2024-01-19 02:00:00');

-- 插入区块链监听状态测试数据
INSERT INTO blockchain_monitor_state (
    network_name, contract_address, last_processed_block, 
    last_processed_time, is_active, created_at, updated_at
) VALUES 
('sepolia', '0x1234567890123456789012345678901234567890', 4567890, 
 '2024-01-19 16:00:00', TRUE, '2024-01-15 00:00:00', '2024-01-19 16:00:00'),

('mainnet', '0x0987654321098765432109876543210987654321', 18890123, 
 '2024-01-19 15:55:00', TRUE, '2024-01-15 00:00:00', '2024-01-19 15:55:00'),

('goerli', '0xabcdef1234567890abcdef1234567890abcdef12', 9876543, 
 '2024-01-19 15:50:00', FALSE, '2024-01-15 00:00:00', '2024-01-19 15:50:00');

-- 更新系统配置为测试环境值
UPDATE system_config SET config_value = '10' WHERE config_key = 'max_recipients_per_task';
UPDATE system_config SET config_value = '0.0001' WHERE config_key = 'min_transfer_amount';
UPDATE system_config SET config_value = '10' WHERE config_key = 'max_transfer_amount';
UPDATE system_config SET config_value = '100' WHERE config_key = 'max_total_amount_per_task';
UPDATE system_config SET config_value = '10' WHERE config_key = 'default_gas_price';
UPDATE system_config SET config_value = '3' WHERE config_key = 'confirmation_blocks';
UPDATE system_config SET config_value = '30' WHERE config_key = 'task_timeout_minutes';
UPDATE system_config SET config_value = '10' WHERE config_key = 'monitor_interval_seconds';
UPDATE system_config SET config_value = '7' WHERE config_key = 'cleanup_completed_tasks_days';
UPDATE system_config SET config_value = '3' WHERE config_key = 'cleanup_failed_tasks_days';

-- 插入额外的测试配置
INSERT INTO system_config (config_key, config_value, description) VALUES 
('test_mode_enabled', 'true', '是否启用测试模式'),
('mock_blockchain_enabled', 'true', '是否启用模拟区块链'),
('test_private_key', '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', '测试私钥'),
('test_contract_address', '0x1234567890123456789012345678901234567890', '测试合约地址'),
('test_rpc_url', 'http://localhost:8545', '测试RPC地址')
ON DUPLICATE KEY UPDATE 
config_value = VALUES(config_value),
updated_at = CURRENT_TIMESTAMP;

-- 创建一些额外的测试数据用于分页和搜索测试
INSERT INTO batch_transfer_task (
    task_name, recipient_count, total_amount, status, created_at, updated_at
) VALUES 
('批量转账测试-9', 1, 0.100000000000000000, 'COMPLETED', '2024-01-10 10:00:00', '2024-01-10 10:05:00'),
('批量转账测试-10', 1, 0.200000000000000000, 'COMPLETED', '2024-01-11 11:00:00', '2024-01-11 11:05:00'),
('批量转账测试-11', 1, 0.300000000000000000, 'COMPLETED', '2024-01-12 12:00:00', '2024-01-12 12:05:00'),
('批量转账测试-12', 1, 0.400000000000000000, 'PENDING', '2024-01-13 13:00:00', '2024-01-13 13:00:00'),
('批量转账测试-13', 1, 0.500000000000000000, 'PENDING', '2024-01-14 14:00:00', '2024-01-14 14:00:00');

-- 为新创建的任务添加转账项
INSERT INTO batch_transfer_item (task_id, recipient_address, amount, status, created_at)
SELECT 
    t.id,
    CONCAT('0x', LPAD(HEX(t.id * 1000 + 1), 40, '0')),
    t.total_amount,
    CASE WHEN t.status = 'COMPLETED' THEN 'SUCCESS' ELSE 'PENDING' END,
    t.created_at
FROM batch_transfer_task t 
WHERE t.id > 8;

-- 验证数据完整性
SELECT 
    '任务统计' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'EXECUTING' THEN 1 END) as executing,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
FROM batch_transfer_task

UNION ALL

SELECT 
    '转账项统计' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
    0 as executing,
    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
FROM batch_transfer_item;

-- 显示测试数据摘要
SELECT 
    'Test data created successfully!' as message,
    (SELECT COUNT(*) FROM batch_transfer_task) as total_tasks,
    (SELECT COUNT(*) FROM batch_transfer_item) as total_items,
    (SELECT COUNT(*) FROM operation_log) as total_logs,
    (SELECT COUNT(*) FROM system_config) as total_configs;

-- 显示任务状态分布
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM batch_transfer_task), 2) as percentage
FROM batch_transfer_task 
GROUP BY status 
ORDER BY count DESC;

-- 显示最近的操作日志
SELECT 
    operation_type,
    operation_desc,
    task_id,
    operator,
    status,
    created_at
FROM operation_log 
ORDER BY created_at DESC 
LIMIT 10;