import React from 'react'
import { Layout, Button, Space, Typography, Badge, Tooltip, Dropdown, Avatar, MenuProps, Divider } from 'antd'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  WalletOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  DisconnectOutlined,
  CopyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { useAppStore } from '../../store/useAppStore'
import { message } from 'antd'
import NetworkSelector from '../NetworkSelector'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, blockchain } = useAppStore()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })

  // 复制地址到剪贴板
  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
        message.success('地址已复制到剪贴板')
      } catch (err) {
        message.error('复制失败')
      }
    }
  }

  // 断开连接
  const handleDisconnect = () => {
    disconnect()
    message.info('钱包已断开连接')
  }

  // 格式化地址显示
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 格式化余额显示
  const formatBalance = (bal: any) => {
    if (!bal) return '0.0000'
    const value = parseFloat(bal.formatted)
    return value.toFixed(4)
  }

  // 钱包下拉菜单
  const walletMenuItems: MenuProps['items'] = [
    {
      key: 'address',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>钱包地址</div>
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{address}</div>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'balance',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>余额</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {formatBalance(balance)} {balance?.symbol || 'ETH'}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'network',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>网络</div>
          <div style={{ fontSize: '14px' }}>{chain?.name || '未知网络'}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'copy',
      label: '复制地址',
      icon: <CopyOutlined />,
      onClick: copyAddress,
    },
    {
      key: 'disconnect',
      label: '断开连接',
      icon: <DisconnectOutlined />,
      onClick: handleDisconnect,
      danger: true,
    },
  ]

  return (
    <AntHeader style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderBottom: '1px solid #e5e7eb', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* 左侧：菜单折叠按钮和标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ color: '#6b7280' }}
        />
        
        <div style={{ display: 'block' }}>
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
            ETH批量转账系统
          </Text>
        </div>
      </div>

      {/* 右侧：状态指示器和钱包连接 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 连接状态组件 */}

        
        {/* 网络选择器 */}
        <NetworkSelector compact={true} />



        {/* 分隔线 */}
        <div style={{ height: '24px', width: '1px', backgroundColor: '#d1d5db' }}></div>

        {/* 钱包连接状态 */}
        {isConnected && address ? (
          <Dropdown
            menu={{ items: walletMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div 
              style={{ 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d9d9d9',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#60a5fa'
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Badge status="success" />
              <Avatar 
                size="small" 
                icon={<WalletOutlined />} 
                style={{ backgroundColor: '#1890ff' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: '12px', color: '#666', lineHeight: 1 }}>已连接</Text>
                <Text style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>
                  {formatAddress(address)}
                </Text>
              </div>
              <Text style={{ fontSize: '12px', color: '#1890ff', marginLeft: '4px' }}>▼</Text>
            </div>
          </Dropdown>
        ) : (
          <div className="wallet-connect">
            <ConnectButton 
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
              chainStatus="icon"
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
          </div>
        )}
      </div>
    </AntHeader>
  )
}

export default Header