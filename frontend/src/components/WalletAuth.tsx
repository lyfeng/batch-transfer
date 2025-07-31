import React from 'react'
import { Card, Button, Space, Typography, Alert, Spin } from 'antd'
import { WalletOutlined, LoginOutlined, LoadingOutlined } from '@ant-design/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAuth } from '../hooks/useAuth'

const { Title, Text } = Typography

interface WalletAuthProps {
  children: React.ReactNode
  requireAuth?: boolean
  fallbackContent?: React.ReactNode
}

/**
 * 钱包认证组件
 * 集成钱包连接和JWT认证的完整流程
 */
const WalletAuth: React.FC<WalletAuthProps> = ({ 
  children, 
  requireAuth = true, 
  fallbackContent 
}) => {
  const { isConnected, address } = useAccount()
  const { isAuthenticated, isLoading, login, error, clearError } = useAuth()

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>
  }

  // 如果已经通过认证，渲染子组件
  if (isAuthenticated && isConnected) {
    return <>{children}</>
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          size="large" 
        />
        <Text type="secondary">正在验证认证状态...</Text>
      </div>
    )
  }

  // 如果有自定义的fallback内容，使用它
  if (fallbackContent) {
    return <>{fallbackContent}</>
  }

  // 处理登录
  const handleLogin = async () => {
    if (!isConnected || !address) {
      return
    }

    try {
      clearError()
      await login()
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  // 默认的认证界面
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      padding: '20px' 
    }}>
      <Card 
        style={{ 
          maxWidth: '520px', 
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 图标 */}
          <div>
            <WalletOutlined style={{ 
              fontSize: '64px', 
              color: '#1890ff',
              marginBottom: '16px' 
            }} />
          </div>
          
          {/* 标题和描述 */}
          <div>
            <Title level={3} style={{ marginBottom: '8px' }}>
              {!isConnected ? '连接钱包' : '验证身份'}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {!isConnected 
                ? '请先连接您的钱包以使用批量转账功能'
                : '请签名消息完成身份验证'
              }
            </Text>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert
              message="认证失败"
              description={error}
              type="error"
              showIcon
              closable
              onClose={clearError}
              style={{ textAlign: 'left' }}
            />
          )}

          {/* 操作按钮 */}
          <div style={{ marginTop: '24px' }}>
            {!isConnected ? (
              // 钱包未连接时显示连接按钮
              <ConnectButton />
            ) : (
              // 钱包已连接但未认证时显示登录按钮
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ 
                  padding: '12px 16px',
                  background: '#f6f8fa',
                  borderRadius: '6px',
                  border: '1px solid #e1e4e8'
                }}>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    已连接钱包
                  </Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </Text>
                </div>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  loading={isLoading}
                  onClick={handleLogin}
                  block
                >
                  {isLoading ? '正在验证...' : '签名登录'}
                </Button>
              </Space>
            )}
          </div>

          {/* 提示信息 */}
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {!isConnected 
                ? '支持 MetaMask、WalletConnect 等主流钱包'
                : '此操作不会产生任何费用，仅用于身份验证'
              }
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default WalletAuth