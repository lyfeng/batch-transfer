// 后端API响应类型定义

// 通用API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  data: T
  timestamp: number
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING', 
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// 转账项状态枚举
export enum TransferItemStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// 转账项接口
export interface TransferItem {
  id: number
  recipientAddress: string
  amount: number
  status: TransferItemStatus
  errorMessage?: string
  txHash?: string
  createdAt: string
  updatedAt?: string
}

// 任务接口
export interface Task {
  id: number
  taskName: string
  creatorAddress: string
  description?: string
  totalRecipients: number
  totalAmount: number
  completedCount?: number
  failedCount?: number
  status: TaskStatus
  txHash?: string
  blockNumber?: number
  gasUsed?: number
  errorMessage?: string
  createdAt: string
  updatedAt?: string
  transferItems?: TransferItem[]
}

// 创建任务请求
export interface CreateTaskRequest {
  taskName: string
  transferItems: Array<{
    address: string
    amount: number
  }>
}

// 更新任务状态请求
export interface UpdateTaskStatusRequest {
  status: TaskStatus
  txHash?: string
  blockNumber?: number
  gasUsed?: number
  errorMessage?: string
}

// 任务统计信息
export interface TaskStatistics {
  totalTasks: number
  pendingTasks: number
  executingTasks: number
  completedTasks: number
  failedTasks: number
}

// 监听服务状态
export interface MonitorStatus {
  connected: boolean
  currentBlock: number
  timestamp: number
}

// 健康检查响应
export interface HealthStatus {
  status: string
  timestamp: number
  service: string
  version: string
}