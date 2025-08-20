import React, { useState } from 'react'
import { Button, Modal, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { BatchTransferApi } from '../services/batchTransferApi'
import { TaskStatus } from '../services/types'

interface ResetTaskButtonProps {
  taskId: number
  onSuccess?: () => void
  disabled?: boolean
}

/**
 * 重置任务状态按钮组件
 * 将失败的任务重置为待处理状态，清除错误信息
 */
const ResetTaskButton: React.FC<ResetTaskButtonProps> = ({
  taskId,
  onSuccess,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false)

  const handleResetTask = () => {
    Modal.confirm({
      title: '重置任务状态',
      content: '确定要将此失败任务重置为待处理状态吗？这将清除之前的错误信息和交易哈希。',
      okText: '确定重置',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        try {
          // 重置任务状态为PENDING，清除错误信息
          await BatchTransferApi.updateTaskStatus(taskId, {
            status: TaskStatus.PENDING,
            errorMessage: ''
          })
          
          message.success('任务状态已重置为待处理')
          onSuccess?.()
        } catch (error: any) {
          console.error('重置任务状态失败:', error)
          message.error(`重置失败: ${error.message || '未知错误'}`)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  return (
    <Button
      type="default"
      size="small"
      icon={<ReloadOutlined />}
      loading={loading}
      disabled={disabled}
      onClick={handleResetTask}
    >
      重置状态
    </Button>
  )
}

export default ResetTaskButton