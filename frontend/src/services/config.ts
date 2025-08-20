// API配置
export const API_CONFIG = {
  // 后端API基础URL (使用代理，相对路径)
  BASE_URL: '',
  
  // API版本前缀
  API_PREFIX: '/api/v1',
  
  // 请求超时时间
  TIMEOUT: 10000,
  
  // 重试次数
  RETRY_TIMES: 3,
} as const

// API路径配置
export const API_PATHS = {
  // 认证相关接口
  AUTH: {
    CHALLENGE: '/auth/challenge',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // 批量转账相关接口
  BATCH_TRANSFER: {
    // 任务管理
    TASKS: '/batch-transfer/tasks',
    TASK_DETAIL: (id: number) => `/batch-transfer/tasks/${id}`,
    TASK_STATUS: (id: number) => `/batch-transfer/tasks/${id}/status`,
    TASK_CHECK_STATUS: (id: number) => `/batch-transfer/tasks/${id}/check-status`,
    TASK_STATISTICS: '/batch-transfer/tasks/statistics',
    
    // 监听服务
    MONITOR_STATUS: '/batch-transfer/monitor/status',
    MONITOR_RESTART: '/batch-transfer/monitor/restart',
    
    // 健康检查
    HEALTH: '/batch-transfer/health',
  },
} as const

// 构建完整API URL
export const buildApiUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${path}`
}

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const