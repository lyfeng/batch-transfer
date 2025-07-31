import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UnorderedListOutlined,
  PlusOutlined,
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
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100vh',
        zIndex: 20,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}
      theme="light"
      width={256}
      collapsedWidth={80}
    >
      {/* Logo区域 */}
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderBottom: '1px solid #f0f0f0' 
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SendOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              批量转账
            </Text>
          </div>
        ) : (
          <SendOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
        )}
      </div>

      {/* 导航菜单 */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ 
          height: 'calc(100% - 64px)',
          border: 'none'
        }}
      />
    </Sider>
  )
}

export default Sidebar 