import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'
import { API_CONFIG, buildApiUrl } from './config'
import { TokenManager, AuthService } from './authService'

// 创建axios实例
const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }
    
    // 自动添加JWT Token
    const token = TokenManager.getAccessToken()
    if (token && !isAuthPath(config.url || '')) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`🚀 API请求: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 判断是否为认证相关路径
 */
function isAuthPath(url: string): boolean {
  return url.includes('/auth/')
}

/**
 * 处理Token过期
 */
function handleTokenExpired(): void {
  console.log('🚨 认证已失效，需要重新登录')
  
  // 发布自定义事件，通知应用Token已过期
  window.dispatchEvent(new CustomEvent('auth:token-expired'))
  
  // 显示提示信息
  toast.error('登录已过期，请重新连接钱包登录', {
    duration: 5000,
    position: 'top-center'
  })
}

// 响应拦截器
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API响应: ${response.config.url}`, response.data)
    
    // 统一处理后端API响应格式
    const { data } = response
    
    // 如果是标准的ApiResponse格式
    if (data && typeof data === 'object' && 'success' in data) {
      if (data.success) {
        return data // 返回完整的ApiResponse
      } else {
        // 业务错误
        const errorMessage = data.message || '请求失败'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    }
    
    // 如果不是标准格式，直接返回
    return response
  },
  async (error) => {
    console.error('❌ API响应错误:', error)
    
    // 网络错误处理
    if (!error.response) {
      const message = '网络连接失败，请检查网络或后端服务是否启动'
      toast.error(message)
      return Promise.reject(new Error(message))
    }
    
    const { status, data, config } = error.response
    let errorMessage = '请求失败'
    
    // 处理401未授权错误（Token过期或无效）
    if (status === 401 && !isAuthPath(config.url || '')) {
      console.log('🔄 Token无效，尝试刷新...')
      
      try {
        const refreshToken = TokenManager.getRefreshToken()
        if (refreshToken) {
          // 尝试刷新Token
          const tokenResponse = await AuthService.refreshToken(refreshToken)
          TokenManager.updateAccessToken(tokenResponse)
          
          // 重新发送原始请求
          config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`
          return httpClient.request(config)
        }
      } catch (refreshError) {
        console.error('Token刷新失败:', refreshError)
        // 刷新失败，清除Token并跳转到登录
        TokenManager.clearTokens()
        handleTokenExpired()
        return Promise.reject(new Error('认证已失效，请重新登录'))
      }
      
      // 没有刷新Token，直接处理为登录失效
      TokenManager.clearTokens()
      handleTokenExpired()
      return Promise.reject(new Error('认证已失效，请重新登录'))
    }
    
    // 其他HTTP状态码错误处理
    switch (status) {
      case 400:
        errorMessage = data?.message || '请求参数错误'
        break
      case 401:
        errorMessage = '未授权访问'
        break
      case 403:
        errorMessage = '禁止访问'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 500:
        errorMessage = '服务器内部错误'
        break
      default:
        errorMessage = data?.message || `请求失败 (${status})`
    }
    
    toast.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
  }
)

// 封装常用的HTTP方法
export const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return httpClient.get(url, config)
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return httpClient.post(url, data, config)
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return httpClient.put(url, data, config)
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return httpClient.delete(url, config)
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return httpClient.patch(url, data, config)
  },
}

export default httpClient