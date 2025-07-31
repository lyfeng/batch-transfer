import { useState, useEffect, useCallback } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { toast } from 'react-hot-toast'
import { AuthService, TokenManager, type LoginResponse, type UserInfoResponse } from '../services/authService'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfoResponse | null
  error: string | null
}

interface AuthActions {
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  clearError: () => void
}

export type UseAuthReturn = AuthState & AuthActions

/**
 * 认证Hook
 * 提供钱包登录认证的状态管理和操作方法
 */
export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  })

  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  /**
   * 设置加载状态
   */
  const setLoading = useCallback((loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  /**
   * 设置错误信息
   */
  const setError = useCallback((error: string | null) => {
    setAuthState(prev => ({ ...prev, error }))
  }, [])

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  /**
   * 设置认证状态
   */
  const setAuthenticated = useCallback((isAuthenticated: boolean, user: UserInfoResponse | null = null) => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated,
      user,
      error: null
    }))
  }, [])

  /**
   * 钱包签名登录
   */
  const login = useCallback(async (): Promise<void> => {
    if (!address || !isConnected) {
      throw new Error('请先连接钱包')
    }

    setLoading(true)
    setError(null)

    try {
      // 1. 获取登录挑战
      console.log('🔐 获取登录挑战...')
      const challenge = await AuthService.getChallenge(address)
      
      // 2. 用户签名
      console.log('✍️ 请求用户签名...')
      const signature = await signMessageAsync({
        message: challenge.message
      })

      // 3. 提交签名进行登录
      console.log('📝 提交签名验证...')
      const loginResponse: LoginResponse = await AuthService.login({
        walletAddress: address,
        nonce: challenge.nonce,
        signature
      })

      // 4. 保存Token
      TokenManager.saveTokens(loginResponse)

      // 5. 设置认证状态
      setAuthenticated(true, {
        walletAddress: loginResponse.walletAddress,
        tokenExpiringSoon: false
      })

      console.log('✅ 登录成功!')
      toast.success('登录成功!')

    } catch (error: any) {
      console.error('❌ 登录失败:', error)
      const errorMessage = error.message || '登录失败，请重试'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [address, isConnected, signMessageAsync, setLoading, setError, setAuthenticated])

  /**
   * 退出登录
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      // 调用后端登出接口
      await AuthService.logout()
      console.log('📤 后端登出成功')
    } catch (error) {
      console.warn('后端登出失败，继续清除本地状态:', error)
    }

    // 清除本地状态
    TokenManager.clearTokens()
    setAuthenticated(false, null)
    setLoading(false)
    
    console.log('👋 登出成功')
    toast.success('已退出登录')
  }, [setLoading, setAuthenticated])

  /**
   * 刷新Token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      return false
    }

    try {
      console.log('🔄 刷新Token...')
      const tokenResponse = await AuthService.refreshToken(refreshToken)
      TokenManager.updateAccessToken(tokenResponse)
      
      console.log('✅ Token刷新成功')
      return true
    } catch (error) {
      console.error('❌ Token刷新失败:', error)
      // 刷新失败，清除所有Token
      TokenManager.clearTokens()
      setAuthenticated(false, null)
      return false
    }
  }, [setAuthenticated])

  /**
   * 检查认证状态
   */
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      // 检查是否有Token
      const accessToken = TokenManager.getAccessToken()
      if (!accessToken) {
        setAuthenticated(false)
        return
      }

      // 检查Token是否过期
      if (TokenManager.isTokenExpired()) {
        console.log('Token已过期，尝试刷新...')
        const refreshed = await refreshToken()
        if (!refreshed) {
          setAuthenticated(false)
          return
        }
      }

      // 获取用户信息验证Token有效性
      try {
        const userInfo = await AuthService.getCurrentUser()
        setAuthenticated(true, userInfo)
        console.log('✅ 认证状态验证成功')
      } catch (error) {
        console.log('Token无效，清除认证状态')
        TokenManager.clearTokens()
        setAuthenticated(false)
      }

    } catch (error) {
      console.error('检查认证状态失败:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [refreshToken, setLoading, setAuthenticated])

  /**
   * 初始化时检查认证状态
   */
  useEffect(() => {
    checkAuthStatus()
  }, []) // 只在组件挂载时执行一次

  /**
   * 监听钱包连接状态变化
   */
  useEffect(() => {
    if (!isConnected && authState.isAuthenticated) {
      // 钱包断开连接时，清除认证状态
      console.log('钱包已断开，清除认证状态')
      logout()
    }
  }, [isConnected, authState.isAuthenticated, logout])

  /**
   * 定期检查Token是否即将过期
   */
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const interval = setInterval(() => {
      if (TokenManager.isTokenExpiringSoon()) {
        console.log('Token即将过期，自动刷新...')
        refreshToken()
      }
    }, 5 * 60 * 1000) // 每5分钟检查一次

    return () => clearInterval(interval)
  }, [authState.isAuthenticated, refreshToken])

  /**
   * 监听Token过期事件
   */
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('收到Token过期事件，清除认证状态')
      TokenManager.clearTokens()
      setAuthenticated(false, null)
    }

    window.addEventListener('auth:token-expired', handleTokenExpired)
    return () => window.removeEventListener('auth:token-expired', handleTokenExpired)
  }, [setAuthenticated])

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    clearError
  }
}

export default useAuth