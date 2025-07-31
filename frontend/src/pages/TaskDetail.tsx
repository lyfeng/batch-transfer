import React from 'react'
import { Card, Descriptions, Tag, Table, Button, Space } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'

interface TransferRecord {
  key: string
  address: string
  amount: string
  status: 'pending' | 'success' | 'failed'
  txHash?: string
}

const TaskDetail: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

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
          pending: { color: 'orange', text: '待处理' },
          success: { color: 'green', text: '成功' },
          failed: { color: 'red', text: '失败' },
        }
        const config = statusConfig[status as keyof typeof statusConfig]
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

  const data: TransferRecord[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tasks')}
        >
          返回任务列表
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">任务详情 #{id}</h1>
      </div>
      
      <Card title="任务信息">
        <Descriptions column={2}>
          <Descriptions.Item label="任务名称">示例任务</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="orange">待处理</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="接收者数量">0</Descriptions.Item>
          <Descriptions.Item label="总金额">0 ETH</Descriptions.Item>
          <Descriptions.Item label="创建时间">-</Descriptions.Item>
          <Descriptions.Item label="完成时间">-</Descriptions.Item>
        </Descriptions>
        
        <div className="mt-4">
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              disabled
            >
              执行转账
            </Button>
          </Space>
        </div>
      </Card>
      
      <Card title="转账明细">
        <Table
          columns={columns}
          dataSource={data}
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