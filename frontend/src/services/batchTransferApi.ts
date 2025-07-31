import { http } from './httpClient'
import { API_PATHS } from './config'
import type {
  ApiResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskStatusRequest,
  TaskStatistics,
  MonitorStatus,
  HealthStatus,
  TaskStatus,
} from './types'

/**
 * 批量转账API服务
 */
export class BatchTransferApi {
  
  /**
   * 创建批量转账任务
   */
  static async createTask(request: CreateTaskRequest): Promise<Task> {
    const response = await http.post<ApiResponse<Task>>(
      API_PATHS.BATCH_TRANSFER.TASKS, 
      request
    )
    return response.data
  }

  /**
   * 获取任务详情
   */
  static async getTask(taskId: number): Promise<Task> {
    const response = await http.get<ApiResponse<Task>>(
      API_PATHS.BATCH_TRANSFER.TASK_DETAIL(taskId)
    )
    return response.data
  }

  /**
   * 获取任务列表
   */
  static async getTasks(status?: TaskStatus, creatorAddress?: string): Promise<Task[]> {
    const params: any = {}
    if (status) params.status = status
    if (creatorAddress) params.creatorAddress = creatorAddress
    
    const response = await http.get<ApiResponse<Task[]>>(
      API_PATHS.BATCH_TRANSFER.TASKS,
      { params }
    )
    return response.data
  }

  /**
   * 获取所有任务
   */
  static async getAllTasks(): Promise<Task[]> {
    return this.getTasks()
  }

  /**
   * 根据状态获取任务
   */
  static async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return this.getTasks(status)
  }

  /**
   * 根据创建者地址获取任务
   */
  static async getTasksByCreatorAddress(creatorAddress: string): Promise<Task[]> {
    return this.getTasks(undefined, creatorAddress)
  }

  /**
   * 根据创建者地址和状态获取任务
   */
  static async getTasksByCreatorAddressAndStatus(creatorAddress: string, status: TaskStatus): Promise<Task[]> {
    return this.getTasks(status, creatorAddress)
  }

  /**
   * 更新任务状态
   */
  static async updateTaskStatus(taskId: number, request: UpdateTaskStatusRequest): Promise<Task> {
    const response = await http.put<ApiResponse<Task>>(
      API_PATHS.BATCH_TRANSFER.TASK_STATUS(taskId),
      request
    )
    return response.data
  }

  /**
   * 删除任务
   */
  static async deleteTask(taskId: number): Promise<void> {
    await http.delete<ApiResponse<void>>(
      API_PATHS.BATCH_TRANSFER.TASK_DETAIL(taskId)
    )
  }

  /**
   * 获取任务统计信息
   */
  static async getTaskStatistics(): Promise<TaskStatistics> {
    const response = await http.get<ApiResponse<TaskStatistics>>(
      API_PATHS.BATCH_TRANSFER.TASK_STATISTICS
    )
    return response.data
  }

  /**
   * 手动检查任务状态
   */
  static async checkTaskStatus(taskId: number): Promise<void> {
    await http.post<ApiResponse<void>>(
      API_PATHS.BATCH_TRANSFER.TASK_CHECK_STATUS(taskId)
    )
  }

  /**
   * 获取监听服务状态
   */
  static async getMonitorStatus(): Promise<MonitorStatus> {
    const response = await http.get<ApiResponse<MonitorStatus>>(
      API_PATHS.BATCH_TRANSFER.MONITOR_STATUS
    )
    return response.data
  }

  /**
   * 重启监听服务
   */
  static async restartMonitor(): Promise<void> {
    await http.post<ApiResponse<void>>(
      API_PATHS.BATCH_TRANSFER.MONITOR_RESTART
    )
  }

  /**
   * 健康检查
   */
  static async healthCheck(): Promise<HealthStatus> {
    const response = await http.get<ApiResponse<HealthStatus>>(
      API_PATHS.BATCH_TRANSFER.HEALTH
    )
    return response.data
  }
}

// 导出默认实例
export default BatchTransferApi