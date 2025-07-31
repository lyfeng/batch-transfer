import React from 'react'
import { Layout, Button, Space, Typography, Badge, Tooltip } from 'antd'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  WalletOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined 
} from '@ant-design/icons'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAppStore } from '../../store/useAppStore'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, blockchain } = useAppStore()

  return (
    <AntHeader className="bg-white shadow-sm border-b border-gray-200 px-4 flex items-center justify-between">
      {/* 左侧：菜单折叠按钮和标题 */}
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-800"
        />
        
        <div className="hidden md:block">
          <Text className="text-lg font-semibold text-gray-800">
            ETH批量转账系统
          </Text>
        </div>
      </div>

      {/* 右侧：状态指示器和钱包连接 */}
      <div className="flex items-center space-x-4">
        {/* 区块链连接状态 */}
        <Tooltip title={blockchain.connected ? '区块链已连接' : '区块链未连接'}>
          <Badge 
            status={blockchain.connected ? 'success' : 'error'} 
            text={
              <Text className="text-sm text-gray-600">
                {blockchain.connected 
                  ? `区块 ${blockchain.currentBlock || 'N/A'}` 
                  : '未连接'
                }
              </Text>
            }
          />
        </Tooltip>

        {/* 通知按钮 */}
        <Tooltip title="通知">
          <Button
            type="text"
            icon={<BellOutlined />}
            className="text-gray-600 hover:text-gray-800"
          />
        </Tooltip>

        {/* 设置按钮 */}
        <Tooltip title="设置">
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="text-gray-600 hover:text-gray-800"
          />
        </Tooltip>

        {/* 钱包连接按钮 */}
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
      </div>
    </AntHeader>
  )
}

export default Header 