import { http } from './httpClient'

// 认证相关类型定义
export interface ChallengeRequest {
  walletAddress: string
}

export interface ChallengeResponse {
  nonce: string
  message: string
}

export interface LoginRequest {
  walletAddress: string
  nonce: string
  signature: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  walletAddress: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface UserInfoResponse {
  walletAddress: string
  tokenExpiringSoon: boolean
}

/**
 * 认证服务类
 * 提供钱包登录认证相关的API调用
 */
export class AuthService {
  
  /**
   * 获取登录挑战
   * @param walletAddress 钱包地址
   * @returns 挑战信息
   */
  static async getChallenge(walletAddress: string): Promise<ChallengeResponse> {
    const response = await http.post<{ data: ChallengeResponse }>('/auth/challenge', {
      walletAddress
    })
    return response.data
  }
  
  /**
   * 钱包签名登录
   * @param loginData 登录数据
   * @returns 登录结果
   */
  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<{ data: LoginResponse }>('/auth/login', loginData)
    return response.data
  }
  
  /**
   * 刷新Token
   * @param refreshToken 刷新Token
   * @returns 新的访问Token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await http.post<{ data: RefreshTokenResponse }>('/auth/refresh', {
      refreshToken
    })
    return response.data
  }
  
  /**
   * 退出登录
   */
  static async logout(): Promise<void> {
    await http.post('/auth/logout')
  }
  
  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  static async getCurrentUser(): Promise<UserInfoResponse> {
    const response = await http.get<{ data: UserInfoResponse }>('/auth/me')
    return response.data
  }
}

/**
 * Token管理工具
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry'
  
  /**
   * 保存Token
   */
  static saveTokens(loginResponse: LoginResponse): void {
    const expiryTime = Date.now() + (loginResponse.expiresIn * 1000)
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, loginResponse.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken)
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())
  }
  
  /**
   * 获取访问Token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }
  
  /**
   * 获取刷新Token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }
  
  /**
   * 检查Token是否过期
   */
  static isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
    if (!expiryTime) return true
    
    return Date.now() > parseInt(expiryTime)
  }
  
  /**
   * 检查Token是否即将过期（30分钟内）
   */
  static isTokenExpiringSoon(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
    if (!expiryTime) return true
    
    const thirtyMinutes = 30 * 60 * 1000
    return Date.now() > (parseInt(expiryTime) - thirtyMinutes)
  }
  
  /**
   * 清除所有Token
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
  }
  
  /**
   * 更新访问Token
   */
  static updateAccessToken(tokenResponse: RefreshTokenResponse): void {
    const expiryTime = Date.now() + (tokenResponse.expiresIn * 1000)
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenResponse.accessToken)
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())
  }
}

export default AuthService