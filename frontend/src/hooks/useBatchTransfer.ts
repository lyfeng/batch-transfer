import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { toast } from 'react-hot-toast'
import { BATCH_TRANSFER_ABI, getContractAddress } from '@/constants/contracts'
import { TaskItem } from '@/store/useAppStore'

export const useBatchTransfer = (chainId?: number) => {
  const contractAddress = chainId ? getContractAddress(chainId, 'BatchTransfer') : undefined

  // 读取合约信息
  const { data: maxRecipients } = useContractRead({
    address: contractAddress,
    abi: BATCH_TRANSFER_ABI,
    functionName: 'MAX_RECIPIENTS',
    enabled: !!contractAddress,
  })

  const { data: totalTransactions } = useContractRead({
    address: contractAddress,
    abi: BATCH_TRANSFER_ABI,
    functionName: 'totalTransactions',
    enabled: !!contractAddress,
  })

  // 获取用户统计
  const getUserStats = (userAddress?: string) => {
    return useContractRead({
      address: contractAddress,
      abi: BATCH_TRANSFER_ABI,
      functionName: 'getUserStats',
      args: userAddress ? [userAddress] : undefined,
      enabled: !!contractAddress && !!userAddress,
    })
  }

  // 估算Gas
  const estimateGas = (recipients: string[], amounts: string[]) => {
    return useContractRead({
      address: contractAddress,
      abi: BATCH_TRANSFER_ABI,
      functionName: 'estimateGas',
      args: [recipients, amounts.map(amount => parseEther(amount))],
      enabled: !!contractAddress && recipients.length > 0 && amounts.length > 0,
    })
  }

  // 批量转账
  const prepareBatchTransfer = (transferItems: TaskItem[]) => {
    const recipients = transferItems.map(item => item.address)
    const amounts = transferItems.map(item => parseEther(item.amount.toString()))
    const totalValue = amounts.reduce((sum, amount) => sum + amount, 0n)

    return usePrepareContractWrite({
      address: contractAddress,
      abi: BATCH_TRANSFER_ABI,
      functionName: 'batchTransfer',
      args: [recipients, amounts],
      value: totalValue,
      enabled: !!contractAddress && transferItems.length > 0,
    })
  }

  const useBatchTransferWrite = (transferItems: TaskItem[]) => {
    const { config, error: prepareError } = prepareBatchTransfer(transferItems)
    
    const { write, data, error: writeError, isLoading: isWriteLoading } = useContractWrite(config)
    
    const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess: () => {
        toast.success('批量转账成功！')
      },
      onError: (error: any) => {
        toast.error(`转账失败: ${error.message}`)
      },
    })

    return {
      write,
      data,
      error: prepareError || writeError,
      isLoading: isWriteLoading || isTransactionLoading,
      isSuccess,
    }
  }

  // 紧急提取（仅合约所有者）
  const useEmergencyWithdraw = () => {
    const { config } = usePrepareContractWrite({
      address: contractAddress,
      abi: BATCH_TRANSFER_ABI,
      functionName: 'emergencyWithdraw',
      enabled: !!contractAddress,
    })
    
    const { write, data, error, isLoading: isWriteLoading } = useContractWrite(config)
    
    const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess: () => {
        toast.success('紧急提取成功！')
      },
      onError: (error: any) => {
        toast.error(`提取失败: ${error.message}`)
      },
    })

    return {
      write,
      data,
      error,
      isLoading: isWriteLoading || isTransactionLoading,
      isSuccess,
    }
  }

  // 执行批量转账任务
  const executeBatchTransfer = async (task: TaskItem) => {
    try {
      const transferItems = [task] // 单个任务转换为数组
      const { write } = useBatchTransferWrite(transferItems)
      
      if (write) {
        write()
        return true
      }
      return false
    } catch (error: any) {
      toast.error(`执行转账失败: ${error.message}`)
      return false
    }
  }

  // 工具函数
  const calculateTotalAmount = (transferItems: TaskItem[]) => {
    return transferItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const validateTransferItems = (transferItems: TaskItem[]) => {
    const errors: string[] = []
    
    if (transferItems.length === 0) {
      errors.push('转账列表不能为空')
    }
    
    if (maxRecipients && transferItems.length > Number(maxRecipients)) {
      errors.push(`接收者数量不能超过 ${maxRecipients}`)
    }
    
    transferItems.forEach((item, index) => {
      if (!item.address || item.address === '0x0000000000000000000000000000000000000000') {
        errors.push(`第 ${index + 1} 行：地址无效`)
      }
      
      if (item.amount <= 0) {
        errors.push(`第 ${index + 1} 行：金额必须大于0`)
      }
    })
    
    // 检查重复地址
    const addressSet = new Set()
    transferItems.forEach((item, index) => {
      if (addressSet.has(item.address.toLowerCase())) {
        errors.push(`第 ${index + 1} 行：地址重复`)
      }
      addressSet.add(item.address.toLowerCase())
    })
    
    return errors
  }

  const validateTransferParams = (recipients: string[], amounts: string[]) => {
    if (recipients.length !== amounts.length) {
      throw new Error('收款人数量与金额数量不匹配')
    }

    if (recipients.length === 0) {
      throw new Error('至少需要一个收款人')
    }

    if (maxRecipients && recipients.length > Number(maxRecipients)) {
      throw new Error(`收款人数量不能超过 ${maxRecipients}`)
    }

    // 验证地址格式
    recipients.forEach((address, index) => {
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        throw new Error(`第 ${index + 1} 个地址格式不正确`)
      }
    })

    // 验证金额
    amounts.forEach((amount, index) => {
      const num = parseFloat(amount)
      if (isNaN(num) || num <= 0) {
        throw new Error(`第 ${index + 1} 个金额无效`)
      }
    })

    return true
  }

  return {
    // 合约信息
    contractAddress,
    maxRecipients: maxRecipients ? Number(maxRecipients) : undefined,
    totalTransactions: totalTransactions ? Number(totalTransactions) : undefined,
    
    // 读取函数
    getUserStats,
    estimateGas,
    
    // 写入函数
    useBatchTransferWrite,
    useEmergencyWithdraw,
    executeBatchTransfer,
    
    // 工具函数
    calculateTotalAmount,
    validateTransferItems,
    validateTransferParams,
  }
}

export default useBatchTransfer