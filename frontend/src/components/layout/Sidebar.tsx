import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SettingOutlined,
  SendOutlined,
} from '@ant-design/icons'

const { Sider } = Layout
const { Text } = Typography

interface SidebarProps {
  collapsed: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '任务列表',
    },
    {
      key: '/tasks/create',
      icon: <PlusOutlined />,
      label: '创建任务',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="fixed left-0 top-0 bottom-0 h-screen z-10"
      theme="light"
      width={256}
      collapsedWidth={80}
    >
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <SendOutlined className="text-2xl text-blue-500" />
            <Text className="text-lg font-bold text-gray-800">
              批量转账
            </Text>
          </div>
        ) : (
          <SendOutlined className="text-2xl text-blue-500" />
        )}
      </div>

      {/* 导航菜单 */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-none"
        style={{ height: 'calc(100% - 64px)' }}
      />
    </Sider>
  )
}

export default Sidebar 