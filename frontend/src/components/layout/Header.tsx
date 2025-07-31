import React from 'react'
import { Layout, Button, Space, Typography, Badge, Tooltip, Dropdown, Avatar } from 'antd'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  WalletOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../hooks/useAuth'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, blockchain } = useAppStore()
  const { isConnected, address } = useAccount()
  const { isAuthenticated, isLoading, logout, user } = useAuth()

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 用户菜单
  const userMenu = {
    items: [
      {
        key: 'user-info',
        label: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              当前钱包
            </div>
            <Text code style={{ fontSize: '12px' }}>
              {address?.slice(0, 8)}...{address?.slice(-6)}
            </Text>
          </div>
        ),
        disabled: true,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <AntHeader style={{ 
      background: 'white', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px'
    }}>
      {/* 左侧：菜单按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
        />
      </div>

      {/* 右侧：状态和钱包 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* 区块链连接状态 */}
        <Tooltip title={blockchain.connected ? '区块链节点已连接' : '区块链节点未连接'}>
          <Badge 
            status={blockchain.connected ? 'success' : 'error'} 
            text={blockchain.connected ? 'RPC已连接' : 'RPC未连接'}
          />
        </Tooltip>

        {/* 认证状态 */}
        {isConnected && (
          <Tooltip title={isAuthenticated ? '用户已认证' : '用户未认证'}>
            <Badge 
              status={isAuthenticated ? 'success' : 'warning'} 
              text={isAuthenticated ? '已认证' : '未认证'}
            />
          </Tooltip>
        )}

        {/* 用户信息或钱包连接 */}
        {isAuthenticated && isConnected ? (
          // 已认证用户显示用户菜单
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff' }} 
              />
              <Text strong style={{ color: '#1890ff' }}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Text>
            </Button>
          </Dropdown>
        ) : (
          // 未认证用户显示钱包连接按钮
          <ConnectButton 
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        )}
      </div>
    </AntHeader>
  )
}

export default Header