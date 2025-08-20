import React, { useState, useEffect } from 'react'
import { Table, Button, Tag, Space, Card, message, Spin, Alert } from 'antd'
import { PlusOutlined, EyeOutlined, ReloadOutlined, RedoOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import type { ColumnsType } from 'antd/es/table'
import BatchTransferApi from '../services/batchTransferApi'
import type { TaskStatus } from '../services/types'
import dayjs from 'dayjs'
import { useAuth } from '../hooks/useAuth'

interface TaskRecord {
  key: string
  id: number
  name: string
  status: TaskStatus
  recipients: number
  totalAmount: string
  createdAt: string
}

const TaskList: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, login } = useAuth()
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(false)

  const columns: ColumnsType<TaskRecord> = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (text: string) => (
        <span className="font-mono text-xs">{text}</span>
      ),
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: true,
      },
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: TaskStatus) => {
        const statusConfig = {
          PENDING: { color: 'orange', text: '待处理' },
          EXECUTING: { color: 'blue', text: '执行中' },
          COMPLETED: { color: 'green', text: '已完成' },
          FAILED: { color: 'red', text: '失败' },
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '接收者数量',
      dataIndex: 'recipients',
      key: 'recipients',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <span className="font-medium">{count || 0}</span>
      ),
    },
    {
      title: '总金额 (ETH)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      ellipsis: true,
      render: (amount: string) => (
        <span className="font-mono font-medium text-green-600">
          {amount || '0.00'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      ellipsis: true,
      render: (date: string) => (
        <span className="text-gray-600">{date}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tasks/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'FAILED' && (
            <Button
              type="link"
              size="small"
              icon={<RedoOutlined />}
              onClick={() => navigate(`/tasks/${record.id}`)}
              style={{ color: '#ff4d4f' }}
            >
              重试
            </Button>
          )}
        </Space>
      ),
    },
  ]

  // 获取任务列表
  const loadTasks = async () => {
    if (!isConnected || !address) {
      console.warn('钱包未连接，无法加载任务列表')
      return
    }

    if (!isAuthenticated) {
      console.warn('用户未认证，无法加载任务列表')
      return
    }

    setLoading(true)
    try {
      // 只获取当前用户创建的任务
      const taskList = await BatchTransferApi.getTasksByCreatorAddress(address)
      const taskRecords: TaskRecord[] = taskList.map(task => ({
        key: task.id.toString(),
        id: task.id,
        name: task.taskName,
        status: task.status,
        recipients: task.totalRecipients,
        totalAmount: task.totalAmount.toFixed(4),
        createdAt: dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      }))
      setTasks(taskRecords)
    } catch (error: any) {
      console.error('获取任务列表失败:', error)
      message.error(`获取任务列表失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取数据，依赖钱包连接状态和认证状态
  useEffect(() => {
    if (isConnected && address && isAuthenticated) {
      loadTasks()
    }
  }, [isConnected, address, isAuthenticated])

  return (
    <div style={{ padding: '20px 0' }}>
      {/* 简单标题和按钮 */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0', fontWeight: 'bold' }}>
            我的转账任务
          </h1>
          {address && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              钱包地址: {address.slice(0, 6)}...{address.slice(-4)}
              {isAuthenticated && (
                <span style={{ color: '#52c41a', marginLeft: '8px' }}>✓ 已认证</span>
              )}
            </div>
          )}
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTasks}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/tasks/create')}
          >
            创建新任务
          </Button>
        </Space>
      </div>
        
      {/* 认证提示 */}
      {isConnected && !isAuthenticated && (
        <Alert
          message="需要钱包签名认证"
          description="请先进行钱包签名认证后再查看任务列表"
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
          action={
            <Button size="small" onClick={login}>
              立即认证
            </Button>
          }
        />
      )}

      {/* 简单表格 */}
      <div>
        <Card>
          <Spin spinning={loading} tip="加载中...">
            <Table
              columns={columns}
              dataSource={tasks}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>📋</div>
                    <div>暂无转账任务</div>
                    <div style={{ color: '#999', marginTop: '5px' }}>
                      点击上方按钮创建您的第一个转账任务
                    </div>
                  </div>
                ),
              }}
              rowKey="id"
            />
          </Spin>
        </Card>
      </div>
    </div>
  )
}

export default TaskList