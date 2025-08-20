import React from 'react'
import { Select, Badge, Tooltip, Space, Typography } from 'antd'
import { GlobalOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { SUPPORTED_CHAINS, isUsingTenderly } from '../constants/contracts'

const { Option } = Select
const { Text } = Typography

// 支持的网络配置
const SUPPORTED_NETWORKS = [
  {
    id: mainnet.id,
    name: isUsingTenderly() ? '以太坊主网 (Tenderly)' : '以太坊主网',
    symbol: 'ETH',
    color: '#627EEA',
    testnet: isUsingTenderly()
  },
  {
    id: sepolia.id,
    name: 'Sepolia 测试网',
    symbol: 'SepoliaETH', 
    color: '#F7931A',
    testnet: true
  }
]

interface NetworkSelectorProps {
  compact?: boolean
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ compact = false }) => {
  const { isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  const currentNetwork = SUPPORTED_NETWORKS.find(network => network.id === chainId)
  const isUnsupportedNetwork = isConnected && !currentNetwork

  const handleNetworkChange = (networkId: number) => {
    if (networkId !== chainId) {
      switchChain({ chainId: networkId })
    }
  }

  if (!isConnected) {
    return (
      <Tooltip title="请先连接钱包">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <GlobalOutlined style={{ color: '#9ca3af' }} />
          {!compact && (
            <Text style={{ fontSize: '14px', color: '#9ca3af' }}>未连接</Text>
          )}
        </div>
      </Tooltip>
    )
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Badge 
          status={isUnsupportedNetwork ? 'error' : 'success'} 
          dot 
        />
        <Select
          value={isUnsupportedNetwork ? undefined : chainId}
          placeholder="选择网络"
          style={{ minWidth: 140 }}
          size="small"
          loading={isPending}
          onChange={handleNetworkChange}
          disabled={!isConnected || isPending}
        >
          {SUPPORTED_NETWORKS.map(network => (
            <Option key={network.id} value={network.id}>
              <Space>
                <div 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: network.color 
                  }}
                />
                <span>{network.name}</span>
                {network.testnet && (
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    测试
                  </Text>
                )}
              </Space>
            </Option>
          ))}
        </Select>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 网络状态指示器 */}
      <div className="flex items-center space-x-2">
        {isUnsupportedNetwork ? (
          <Tooltip title="不支持的网络">
            <Badge status="error" dot>
              <ExclamationCircleOutlined className="text-red-500" />
            </Badge>
          </Tooltip>
        ) : (
          <Tooltip title="网络已连接">
            <Badge status="success" dot>
              <CheckCircleOutlined className="text-green-500" />
            </Badge>
          </Tooltip>
        )}
      </div>

      {/* 网络选择器 */}
      <Select
        value={isUnsupportedNetwork ? undefined : chainId}
        placeholder="选择网络"
        style={{ minWidth: 140 }}
        size="small"
        loading={isPending}
        onChange={handleNetworkChange}
        disabled={!isConnected || isPending}
      >
        {SUPPORTED_NETWORKS.map(network => (
          <Option key={network.id} value={network.id}>
            <Space>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: network.color }}
              />
              <span>{network.name}</span>
              {network.testnet && (
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  测试
                </Text>
              )}
            </Space>
          </Option>
        ))}
      </Select>

      {/* 当前网络信息 */}
      {isUnsupportedNetwork && (
        <Tooltip title="当前网络不支持，请切换到支持的网络">
          <Text type="danger" style={{ fontSize: '12px' }}>
            不支持
          </Text>
        </Tooltip>
      )}
    </div>
  )
}

export default NetworkSelector