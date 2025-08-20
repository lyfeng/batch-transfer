import React, { useState } from 'react'
import { Card, Form, Input, Button, Upload, Table, Space, message, Alert } from 'antd'
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { useAuth } from '../hooks/useAuth'
import { BatchTransferApi } from '../services/batchTransferApi'
import { CreateTaskRequest } from '../services/types'
import { formatAddress, getAddressValidationError } from '../utils/addressUtils'

interface RecipientRecord {
  key: string
  address: string
  amount: string
}

const CreateTask: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, login, isLoading: authLoading } = useAuth()
  const [form] = Form.useForm()
  const [recipients, setRecipients] = useState<RecipientRecord[]>([])
  const [loading, setLoading] = useState(false)

  const columns: ColumnsType<RecipientRecord> = [
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
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRecipient(record.key)}
        >
          删除
        </Button>
      ),
    },
  ]

  const handleDeleteRecipient = (key: string) => {
    setRecipients(recipients.filter(item => item.key !== key))
  }

  // 处理地址输入和格式化
  const handleAddressInput = (inputAddress: string, index?: number) => {
    try {
      // 格式化地址，确保有0x前缀
      const formattedAddress = formatAddress(inputAddress)
      
      // 如果是更新现有记录
      if (typeof index === 'number' && index >= 0) {
        const newRecipients = [...recipients]
        newRecipients[index] = {
          ...newRecipients[index],
          address: formattedAddress
        }
        setRecipients(newRecipients)
      }
      
      // 验证地址
      const error = getAddressValidationError(formattedAddress)
      if (error) {
        message.error(`地址验证失败: ${error}`)
        return null
      }
      
      return formattedAddress
    } catch (error) {
      message.error('地址格式化失败，请检查地址格式')
      return null
    }
  }

  const handleAddRecipient = () => {
    const inputAddress = form.getFieldValue('recipientAddress')
    const amount = form.getFieldValue('recipientAmount')

    if (!inputAddress || !amount) {
      message.error('请填写接收地址和金额')
      return
    }

    // 使用地址格式化和校验
    const formattedAddress = handleAddressInput(inputAddress)
    if (!formattedAddress) {
      return // 地址验证失败，错误信息已在handleAddressInput中显示
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      message.error('请输入有效的金额')
      return
    }

    const newRecipient: RecipientRecord = {
      key: Date.now().toString(),
      address: formattedAddress, // 使用格式化后的地址
      amount,
    }

    setRecipients([...recipients, newRecipient])
    form.setFieldsValue({ recipientAddress: '', recipientAmount: '' })
  }

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.csv,.xlsx,.xls',
    beforeUpload: () => {
      message.info('CSV文件上传功能待实现')
      return false
    },
  }

  const handleSubmit = async (values: any) => {
    if (!isConnected || !address) {
      message.error('请先连接钱包')
      return
    }

    if (!isAuthenticated) {
      message.error('请先完成钱包签名认证')
      return
    }

    if (recipients.length === 0) {
      message.error('请至少添加一个接收者')
      return
    }

    setLoading(true)
    try {
      // 构建创建任务请求，确保所有地址都经过格式化
      const transferItems = recipients.map(recipient => {
        const formattedAddress = handleAddressInput(recipient.address)
        return {
          address: formattedAddress || recipient.address, // 如果格式化失败，使用原地址
          amount: parseFloat(recipient.amount)
        }
      })

      const createTaskRequest: CreateTaskRequest = {
        taskName: values.taskName,
        transferItems
      }

      const task = await BatchTransferApi.createTask(createTaskRequest)
      message.success('任务创建成功！')
      navigate(`/task/${task.id}`)
    } catch (error: any) {
      message.error(`创建任务失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = recipients.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/tasks')}
        >
          返回任务列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">创建转账任务</h1>
          {address && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              创建者: {address.slice(0, 6)}...{address.slice(-4)}
              {isAuthenticated && <span style={{ color: '#52c41a', marginLeft: '8px' }}>✓ 已认证</span>}
            </div>
          )}
        </div>
      </div>
      
      {/* 认证状态提示 */}
      {isConnected && !isAuthenticated && (
        <Alert
          message="需要完成钱包签名认证"
          description="为了确保安全，创建任务前需要通过钱包签名进行身份认证。"
          type="warning"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary" 
              loading={authLoading}
              onClick={login}
            >
              立即认证
            </Button>
          }
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Card title="基本信息">
          <Form.Item
            label="任务名称"
            name="taskName"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          
          <Form.Item label="任务描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入任务描述（可选）" />
          </Form.Item>
        </Card>
        
        <Card title="添加接收者">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Form.Item 
              label="接收地址" 
              name="recipientAddress"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve()
                    }
                    const error = getAddressValidationError(value)
                    if (error) {
                      return Promise.reject(new Error(error))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input placeholder="0x..." />
            </Form.Item>
            <Form.Item label="金额 (ETH)" name="recipientAmount">
              <Input placeholder="0.1" type="number" step="0.001" min="0" />
            </Form.Item>
            <Form.Item label=" " className="flex items-end">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRecipient}
                >
                  添加
                </Button>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>批量导入</Button>
                </Upload>
              </Space>
            </Form.Item>
          </div>
        </Card>
        
        <Card title={`接收者列表 (${recipients.length}个，总计 ${totalAmount.toFixed(4)} ETH)`}>
          <Table
            columns={columns}
            dataSource={recipients}
            pagination={false}
            locale={{
              emptyText: '暂无接收者，请添加接收者',
            }}
          />
        </Card>
        
        <Card>
          <div className="flex justify-end space-x-4">
            <Button onClick={() => navigate('/tasks')}>取消</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={recipients.length === 0 || !isConnected || !isAuthenticated}
            >
              创建任务
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  )
}

export default CreateTask