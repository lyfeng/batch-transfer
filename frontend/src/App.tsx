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
import Settings from './pages/Settings'
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
      
      <Layout className="min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} />
        
        <Layout className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <Header />
          
          <Content className="p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/create" element={<CreateTask />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/settings" element={<Settings />} />
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