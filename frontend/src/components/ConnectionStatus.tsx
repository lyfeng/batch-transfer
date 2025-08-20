import React from 'react'
import { Badge, Tooltip, Space, Typography, Card } from 'antd'
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useAccount, useBlockNumber } from 'wagmi'
import { useAppStore } from '../store/useAppStore'

const { Text } = Typography

interface ConnectionStatusProps {
  showDetails?: boolean
  compact?: boolean
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  compact = false 
}) => {
  const { isConnected, isConnecting, isReconnecting } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const { blockchain } = useAppStore()

  // 确定连接状态
  const getConnectionStatus = () => {
    if (isConnecting || isReconnecting) {
      return {
        status: 'processing' as const,
        color: '#1890ff',
        icon: <LoadingOutlined />,
        text: '连接中...',
        description: '正在连接钱包和网络'
      }
    }

    if (!isConnected) {
      return {
        status: 'error' as const,
        color: '#ff4d4f',
        icon: <DisconnectOutlined />,
        text: '未连接',
        description: '钱包未连接'
      }
    }

    if (!blockchain.connected) {
      return {
        status: 'warning' as const,
        color: '#faad14',
        icon: <ExclamationCircleOutlined />,
        text: '网络异常',
        description: '钱包已连接但网络连接异常'
      }
    }

    return {
      status: 'success' as const,
      color: '#52c41a',
      icon: <CheckCircleOutlined />,
      text: '已连接',
      description: '钱包和网络连接正常'
    }
  }

  const connectionStatus = getConnectionStatus()

  // 简洁模式
  if (compact) {
    return (
      <Tooltip 
        title={
          <div>
            <div>{connectionStatus.description}</div>
            {(blockNumber && blockNumber > BigInt(0)) ? (
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                区块高度: {String(blockNumber)}
              </div>
            ) : null}
          </div>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Badge status={connectionStatus.status} />
          <span style={{ color: connectionStatus.color }}>
            {connectionStatus.icon}
          </span>
        </div>
      </Tooltip>
    )
  }

  // 详细模式
  if (showDetails) {
    return (
      <Card size="small" style={{ minWidth: 200 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div className="flex items-center justify-between">
            <Text strong>连接状态</Text>
            <div className="flex items-center space-x-1">
              <Badge status={connectionStatus.status} />
              <span style={{ color: connectionStatus.color }}>
                {connectionStatus.icon}
              </span>
            </div>
          </div>
          
          <div>
            <Text style={{ fontSize: '14px' }}>
              {connectionStatus.text}
            </Text>
          </div>

          {isConnected && blockchain.connected && (
            <>
              <div className="flex justify-between">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  区块高度:
                </Text>
                <Text code style={{ fontSize: '12px' }}>
                  {blockNumber ? blockNumber.toString() : 'N/A'}
                </Text>
              </div>
              
              <div className="flex justify-between">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  最后更新:
                </Text>
                <Text style={{ fontSize: '12px' }}>
                  {new Date().toLocaleTimeString()}
                </Text>
              </div>
            </>
          )}
        </Space>
      </Card>
    )
  }

  // 标准模式
  return (
    <Tooltip title={connectionStatus.description}>
      <div 
        className="flex items-center space-x-2 px-2 py-1 rounded-md border"
        style={{ 
          borderColor: connectionStatus.color,
          backgroundColor: `${connectionStatus.color}10`
        }}
      >
        <Badge status={connectionStatus.status} />
        <span style={{ color: connectionStatus.color }}>
          {connectionStatus.icon}
        </span>
        <Text 
          style={{ 
            fontSize: '12px', 
            color: connectionStatus.color,
            fontWeight: 500
          }}
        >
          {connectionStatus.text}
        </Text>
        {(isConnected && blockchain.connected && blockNumber && blockNumber > BigInt(0)) ? (
          <Text 
            type="secondary" 
            style={{ fontSize: '10px' }}
          >
            #{String(blockNumber).slice(-4)}
          </Text>
        ) : null}
      </div>
    </Tooltip>
  )
}

export default ConnectionStatus