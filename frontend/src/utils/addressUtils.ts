import { isAddress, getAddress } from 'viem'

/**
 * 验证以太坊地址格式
 * @param address 地址字符串
 * @returns 是否为有效地址
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  const trimmedAddress = address.trim()

  // 使用viem的isAddress函数进行基础验证
  if (!isAddress(trimmedAddress)) {
    return false
  }

  // 验证checksum
  if (!isValidChecksum(trimmedAddress)) {
    return false
  }

  return true
}

/**
 * 验证以太坊地址的checksum
 * @param address 地址字符串（必须包含0x前缀）
 * @returns 是否为有效的checksum地址
 */
export function isValidChecksum(address: string): boolean {
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return false
  }

  // 如果地址全是小写或全是大写，则不需要checksum验证
  const addressPart = address.substring(2)
  if (addressPart === addressPart.toLowerCase() || 
      addressPart === addressPart.toUpperCase()) {
    return true
  }

  try {
    // 使用viem的getAddress函数来验证checksum
    const checksumAddress = getAddress(address)
    return address === checksumAddress
  } catch {
    return false
  }
}

/**
 * 将地址转换为checksum格式
 * @param address 原始地址
 * @returns checksum格式的地址
 */
export function toChecksumAddress(address: string): string {
  if (!address) {
    throw new Error('Address cannot be empty')
  }

  try {
    // 使用viem的getAddress函数来获取checksum格式的地址
    return getAddress(address)
  } catch (error) {
    throw new Error('Invalid address format')
  }
}

/**
 * 获取地址校验错误信息
 * @param address 地址字符串
 * @returns 错误信息，如果地址有效则返回null
 */
export function getAddressValidationError(address: string): string | null {
  if (!address || typeof address !== 'string') {
    return '地址不能为空'
  }

  const trimmedAddress = address.trim()

  if (!trimmedAddress.startsWith('0x')) {
    return '地址必须以0x开头'
  }

  if (trimmedAddress.length !== 42) {
    return '地址必须是42位字符（包含0x前缀）'
  }

  const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/
  if (!ethAddressPattern.test(trimmedAddress)) {
    return '地址必须是有效的十六进制字符（0-9, a-f, A-F）'
  }

  if (!isValidChecksum(trimmedAddress)) {
    return '地址checksum验证失败，请检查地址大小写是否正确'
  }

  return null
}

/**
 * 格式化以太坊地址，确保有正确的0x前缀
 * @param address 原始地址字符串
 * @returns 格式化后的地址
 */
export function formatAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    throw new Error('Address cannot be empty')
  }

  const trimmedAddress = address.trim()
  
  // 如果地址不以0x开头，添加0x前缀
  const formattedAddress = trimmedAddress.startsWith('0x') 
    ? trimmedAddress 
    : `0x${trimmedAddress}`

  // 验证格式化后的地址是否有效
  if (!isAddress(formattedAddress)) {
    throw new Error('Invalid address format')
  }

  return formattedAddress
}

/**
 * 安全格式化地址，不抛出异常
 * @param address 原始地址字符串
 * @returns 格式化后的地址，如果无效则返回原地址
 */
export function safeFormatAddress(address: string): string {
  try {
    return formatAddress(address)
  } catch {
    return address
  }
}