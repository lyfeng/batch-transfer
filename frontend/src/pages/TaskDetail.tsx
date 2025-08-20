import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Table, Button, Space, Spin, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { BatchTransferApi } from '../services/batchTransferApi'
import { Task, TransferItem } from '../services/types'
import ExecuteTransferButton from '../components/ExecuteTransferButton'
import dayjs from 'dayjs'

interface TransferRecord {
  key: string
  address: string
  amount: string
  status: string
  txHash?: string
}

const TaskDetail: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)
  const [transferItems, setTransferItems] = useState<TransferRecord[]>([])

  // 获取任务详情
  const loadTaskDetail = async () => {
    if (!id) {
      message.error('任务ID无效')
      navigate('/tasks')
      return
    }

    setLoading(true)
    try {
      console.log('🔍 获取任务详情:', id)
      const taskData = await BatchTransferApi.getTask(parseInt(id))
      setTask(taskData)
      
      // 转换转账项数据格式
      const items: TransferRecord[] = taskData.transferItems?.map((item: TransferItem, index: number) => ({
        key: index.toString(),
        address: item.recipientAddress,
        amount: item.amount.toString(),
        status: item.status,
        txHash: item.txHash
      })) || []
      setTransferItems(items)
      
      console.log('✅ 任务详情加载成功:', taskData)
    } catch (error: any) {
      console.error('❌ 获取任务详情失败:', error)
      message.error(`获取任务详情失败: ${error.message || '未知错误'}`)
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }



  // 页面加载时获取数据
  useEffect(() => {
    loadTaskDetail()
  }, [id])

  const columns: ColumnsType<TransferRecord> = [
    {
      title: '接收地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '金额 (ETH)',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          PENDING: { color: 'orange', text: '待处理' },
          SUCCESS: { color: 'green', text: '成功' },
          FAILED: { color: 'red', text: '失败' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '交易哈希',
      dataIndex: 'txHash',
      key: 'txHash',
      ellipsis: true,
      render: (txHash: string) => (
        txHash ? (
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            {txHash}
          </a>
        ) : '-'
      ),
    },
  ]

  // 状态标签配置
  const getStatusConfig = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: '待处理' },
      EXECUTING: { color: 'blue', text: '执行中' },
      COMPLETED: { color: 'green', text: '已完成' },
      FAILED: { color: 'red', text: '失败' },
    }
    return statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <span>正在加载任务详情...</span>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tasks')}
          >
            返回任务列表
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">任务不存在</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tasks')}
        >
          返回任务列表
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">任务详情 #{task.id}</h1>
      </div>
      
      <Card title="任务信息">
        <Descriptions column={2}>
          <Descriptions.Item label="任务名称">{task.taskName}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {(() => {
              const config = getStatusConfig(task.status)
              return <Tag color={config.color}>{config.text}</Tag>
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="接收者数量">{task.totalRecipients}</Descriptions.Item>
          <Descriptions.Item label="总金额">{task.totalAmount.toFixed(4)} ETH</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {task.updatedAt ? dayjs(task.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          {task.txHash && (
            <Descriptions.Item label="交易哈希" span={2}>
              <a
                href={`https://etherscan.io/tx/${task.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {task.txHash}
              </a>
            </Descriptions.Item>
          )}
          {task.errorMessage && (
            <Descriptions.Item label="错误信息" span={2}>
              <span className="text-red-500">{task.errorMessage}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
        
        <div className="mt-4">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {task.status === 'FAILED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">转账执行失败</h3>
                    <p className="mt-1 text-sm text-red-700">
                      此任务执行失败，您可以点击下方的"重新转账"按钮重新执行。请确保您的钱包有足够的余额支付转账金额和Gas费用。
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
               <ExecuteTransferButton
                 task={task}
                 onSuccess={() => {
                   // 执行成功后重新加载任务详情
                   setTimeout(() => {
                     loadTaskDetail()
                   }, 2000)
                 }}
                 onError={(error) => {
                   console.error('执行转账失败:', error)
                   // 执行失败后也重新加载任务详情以更新状态
                   setTimeout(() => {
                     loadTaskDetail()
                   }, 1000)
                 }}
               />
             </div>
          </Space>
        </div>
      </Card>
      
      <Card title={`转账明细 (${transferItems.length}条)`}>
        <Table
          columns={columns}
          dataSource={transferItems}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          locale={{
            emptyText: '暂无转账记录',
          }}
        />
      </Card>
    </div>
  )
}

export default TaskDetail