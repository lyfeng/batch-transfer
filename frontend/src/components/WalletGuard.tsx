import React from 'react'
import { Card, Button, Typography, Space } from 'antd'
import { WalletOutlined } from '@ant-design/icons'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const { Title, Text } = Typography

interface WalletGuardProps {
  children: React.ReactNode
  requireConnection?: boolean
  fallbackContent?: React.ReactNode
}

/**
 * 钱包连接守卫组件
 * 如果用户未连接钱包，则显示连接提示
 */
const WalletGuard: React.FC<WalletGuardProps> = ({ 
  children, 
  requireConnection = true, 
  fallbackContent 
}) => {
  const { isConnected, address } = useAccount()

  // 如果不需要强制连接，或者已经连接，直接渲染子组件
  if (!requireConnection || isConnected) {
    return <>{children}</>
  }

  // 如果有自定义的fallback内容，使用它
  if (fallbackContent) {
    return <>{fallbackContent}</>
  }

  // 默认的钱包连接提示界面
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
          maxWidth: '480px', 
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <WalletOutlined style={{ 
              fontSize: '64px', 
              color: '#1890ff',
              marginBottom: '16px' 
            }} />
          </div>
          
          <div>
            <Title level={3} style={{ marginBottom: '8px' }}>
              连接钱包
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              请先连接您的钱包以使用批量转账功能
            </Text>
          </div>

          <div style={{ marginTop: '24px' }}>
            <ConnectButton />
          </div>

          <div style={{ marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              支持 MetaMask、WalletConnect 等主流钱包
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default WalletGuard