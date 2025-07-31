import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { Helmet } from 'react-helmet-async'

import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import TaskList from './pages/TaskList'
import TaskDetail from './pages/TaskDetail'
import CreateTask from './pages/CreateTask'
import Dashboard from './pages/Dashboard'

import { useAppStore } from './store/useAppStore'

const { Content } = Layout

const App: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()

  return (
    <>
      <Helmet>
        <title>ETH批量转账系统</title>
        <meta name="description" content="安全、高效的以太坊批量转账解决方案" />
      </Helmet>
      
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar collapsed={sidebarCollapsed} />
        
        <Layout style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '256px',
          transition: 'margin-left 0.3s'
        }}>
          <Header />
          
          <Content style={{ 
            minHeight: 'calc(100vh - 64px)', 
            background: '#f5f5f5',
            padding: '20px'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/create" element={<CreateTask />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  )
}

export default App