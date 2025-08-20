import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, message, Button, List, Tag, Space } from 'antd'
import { WalletOutlined, SendOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, RedoOutlined, EyeOutlined } from '@ant-design/icons'
import { useAccount, useBalance } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import BatchTransferApi from '../services/batchTransferApi'
import type { TaskStatistics, Task } from '../services/types'
import { TaskStatus } from '../services/types'
import { useAuth } from '../hooks/useAuth'

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null)
  const [failedTasks, setFailedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingFailedTasks, setLoadingFailedTasks] = useState(false)
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 获取统计数据
  const loadStatistics = async () => {
    setLoading(true)
    try {
      const stats = await BatchTransferApi.getTaskStatistics()
      setStatistics(stats)
    } catch (error: any) {
      console.error('获取统计数据失败:', error)
      message.error(`获取统计数据失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  // 获取失败的任务
  const loadFailedTasks = async () => {
    if (!isConnected || !address || !isAuthenticated) {
      return
    }

    setLoadingFailedTasks(true)
    try {
      const tasks = await BatchTransferApi.getTasksByCreatorAddressAndStatus(address, TaskStatus.FAILED)
      setFailedTasks(tasks.slice(0, 5)) // 只显示最近的5个失败任务
    } catch (error: any) {
      console.error('获取失败任务失败:', error)
    } finally {
      setLoadingFailedTasks(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    loadStatistics()
  }, [])

  // 当钱包连接和认证状态变化时获取失败任务
  useEffect(() => {
    if (isConnected && address && isAuthenticated) {
      loadFailedTasks()
    }
  }, [isConnected, address, isAuthenticated])

  return (
    <div style={{ padding: '20px 0' }}>
      {/* 简单标题 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 20px 0', fontWeight: 'bold' }}>
          仪表板
        </h1>
      </div>
      
      {/* 统计卡片 */}
      <div style={{ marginBottom: '40px' }}>
        <Spin spinning={loading} tip="加载统计数据...">
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="钱包余额"
                  value={isConnected && balance ? parseFloat(balance.formatted) : 0}
                  suffix="ETH"
                  prefix={<WalletOutlined />}
                  precision={4}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总任务数"
                  value={statistics?.totalTasks || 0}
                  prefix={<SendOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={statistics?.completedTasks || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="待处理"
                  value={statistics?.pendingTasks || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 第二行统计 */}
          <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="执行中"
                  value={statistics?.executingTasks || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="失败任务"
                  value={statistics?.failedTasks || 0}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="成功率"
                  value={statistics && statistics.totalTasks > 0 
                    ? ((statistics.completedTasks / statistics.totalTasks) * 100).toFixed(1)
                    : 0}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="连接状态"
                  value={isConnected ? '已连接' : '未连接'}
                  prefix={<WalletOutlined />}
                  valueStyle={{ color: isConnected ? '#3f8600' : '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
      
      {/* 活动区域 */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card 
            title="系统状态" 
            extra={
              <span style={{ color: '#999', fontSize: '12px' }}>
                最后更新: {new Date().toLocaleString()}
              </span>
            }
          >
            {isConnected ? (
              <div>
                <p><strong>钱包地址:</strong> {address}</p>
                <p><strong>当前余额:</strong> {balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : 'Loading...'}</p>
                <p><strong>网络状态:</strong> <span style={{ color: '#3f8600' }}>已连接</span></p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔗</div>
                <div>请连接钱包以查看详细信息</div>
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="失败任务" 
            extra={
              failedTasks.length > 0 && (
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => navigate('/tasks')}
                >
                  查看全部
                </Button>
              )
            }
          >
            <Spin spinning={loadingFailedTasks}>
              {failedTasks.length > 0 ? (
                <List
                  size="small"
                  dataSource={failedTasks}
                  renderItem={(task) => (
                    <List.Item
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          查看
                        </Button>,
                        <Button
                          key="retry"
                          type="link"
                          size="small"
                          icon={<RedoOutlined />}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          style={{ color: '#ff4d4f' }}
                        >
                          重试
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <span>{task.taskName}</span>
                            <Tag color="red">失败</Tag>
                          </Space>
                        }
                        description={`${task.totalRecipients} 个接收者 • ${task.totalAmount.toFixed(4)} ETH`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  {isConnected && isAuthenticated ? (
                    <>
                      <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                      <div>暂无失败任务</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔗</div>
                      <div>请连接钱包并认证后查看</div>
                    </>
                  )}
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard