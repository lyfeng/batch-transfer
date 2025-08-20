import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { message } from 'antd'
import { Task } from '../services/types'
import { BATCH_TRANSFER_ABI, getContractAddress } from '../constants/contracts'
import { BatchTransferApi } from '../services/batchTransferApi'
import { TaskStatus } from '../services/types'
import { formatAddress } from '../utils/addressUtils'

interface ExecuteTransferButtonProps {
  task: Task
  onSuccess?: () => void
  onError?: (error: Error) => void
  disabled?: boolean
}

/**
 * 执行转账按钮组件
 * 使用 wagmi hooks 进行真实的合约调用
 */
const ExecuteTransferButton: React.FC<ExecuteTransferButtonProps> = ({
  task,
  onSuccess,
  onError,
  disabled = false
}) => {
  const { address, isConnected, chain } = useAccount()
  const [isExecuting, setIsExecuting] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const contractAddress = getContractAddress(chain?.id || 11155111, 'BatchTransfer')

  // 准备合约调用参数 - 添加地址格式化处理
  const recipients = task.transferItems?.map(item => {
    try {
      // 确保地址格式正确，添加0x前缀（如果缺失）
      const formattedAddress = formatAddress(item.recipientAddress)
      return formattedAddress as `0x${string}`
    } catch (error) {
      console.error('地址格式化失败:', item.recipientAddress, error)
      // 如果格式化失败，使用原地址（可能会在合约调用时失败）
      return item.recipientAddress as `0x${string}`
    }
  }) || []
  
  const amounts = task.transferItems?.map(item => parseEther(item.amount.toString())) || []
  const totalValue = amounts.reduce((sum, amount) => sum + amount, BigInt(0))

  // 合约写入
  const { 
    writeContract, 
    data: writeData,
    error: writeError, 
    isPending: isWritePending 
  } = useWriteContract()

  // 等待交易确认
  const { 
    isLoading: isTransactionLoading, 
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError,
    data: transactionData
  } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  // 监听写入成功，设置交易哈希
  useEffect(() => {
    if (writeData && !txHash) {
      console.log('💫 交易已提交，哈希:', writeData)
      setTxHash(writeData)
      
      // 只更新交易哈希，不重复更新状态为EXECUTING
      BatchTransferApi.updateTaskStatus(task.id, {
        txHash: writeData
      }).catch(console.error)
    }
  }, [writeData, txHash, task.id])

  // 监听交易成功
  useEffect(() => {
    if (isTransactionSuccess && transactionData && txHash) {
      handleTransactionSuccess(transactionData)
    }
  }, [isTransactionSuccess, transactionData, txHash])

  // 处理交易成功
  const handleTransactionSuccess = async (data: any) => {
    console.log('✅ 交易确认成功:', data)
    
    try {
      // 更新任务状态为已完成
      await BatchTransferApi.updateTaskStatus(task.id, {
        status: TaskStatus.COMPLETED,
        txHash: txHash,
        blockNumber: Number(data.blockNumber),
        gasUsed: Number(data.gasUsed)
      })
      
      message.success('批量转账执行成功！')
      onSuccess?.()
    } catch (error: any) {
      console.error('更新任务状态失败:', error)
      message.error('转账成功但状态更新失败')
    } finally {
      setIsExecuting(false)
    }
  }

  // 处理交易失败
  const handleTransactionError = async (error: Error) => {
    console.error('❌ 交易失败:', error)
    
    try {
      // 更新任务状态为失败
      await BatchTransferApi.updateTaskStatus(task.id, {
        status: TaskStatus.FAILED,
        txHash: txHash,
        errorMessage: error.message || '交易执行失败'
      })
    } catch (updateError) {
      console.error('更新任务状态失败:', updateError)
    }
    
    message.error(`转账失败: ${error.message}`)
    onError?.(error)
    setIsExecuting(false)
  }

  // 执行转账
  const handleExecuteTransfer = async () => {
    console.log('🚀 开始执行转账流程')
    
    // 检查钱包扩展程序
    if (typeof window.ethereum === 'undefined') {
      message.error('未检测到钱包扩展程序，请安装MetaMask或其他Web3钱包')
      return
    }
    
    console.log('🔍 钱包扩展程序状态:', {
      ethereum: !!window.ethereum,
      isMetaMask: window.ethereum?.isMetaMask,
      chainId: window.ethereum?.chainId,
      selectedAddress: window.ethereum?.selectedAddress
    })
    
    if (!isConnected || !address) {
      message.error('请先连接钱包')
      return
    }

    // 详细的钱包连接状态检查
    console.log('🔍 详细的钱包状态:', {
      isConnected,
      address,
      chainId: chain?.id,
      chainName: chain?.name,
      writeContractAvailable: !!writeContract,
      writeContractPending: isWritePending,
      writeError: writeError?.message
    })

    // 检查钱包是否已解锁
    // 如果wagmi显示已连接且有地址，说明钱包已解锁
    if (!address) {
      message.error('钱包未解锁，请先解锁您的钱包')
      return
    }
    
    // 额外验证：检查当前地址是否与钱包中的地址一致
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts && accounts.length > 0) {
        const currentAccount = accounts[0].toLowerCase()
        const connectedAddress = address.toLowerCase()
        if (currentAccount !== connectedAddress) {
          message.error('钱包地址不匹配，请检查钱包连接状态')
          return
        }
        console.log('✅ 钱包账户状态正常:', accounts)
      } else {
        // 如果eth_accounts返回空数组，但wagmi显示已连接，可能是钱包的权限问题
        // 尝试重新请求权限
        console.warn('⚠️ eth_accounts返回空数组，尝试重新请求权限...')
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          console.log('✅ 重新请求权限成功')
        } catch (permissionError) {
          console.error('❌ 重新请求权限失败:', permissionError)
          message.error('钱包权限异常，请重新连接钱包')
          return
        }
      }
    } catch (accountError) {
      console.error('❌ 无法获取钱包账户:', accountError)
      // 如果无法通过window.ethereum获取账户，但wagmi显示已连接，继续执行
      console.warn('⚠️ 无法通过window.ethereum获取账户，但wagmi显示已连接，继续执行...')
    }

    // 添加调试信息
    console.log('🔍 执行转账调试信息:', {
      isConnected,
      address,
      chainId: chain?.id,
      chainName: chain?.name,
      contractAddress,
      taskStatus: task.status
    })

    if (!contractAddress) {
      message.error(`当前网络不支持批量转账。当前网络: ${chain?.name || '未知'} (${chain?.id || '未知'})`)
      return
    }

    if (task.status !== 'PENDING' && task.status !== 'FAILED') {
      message.error('只能执行待处理或失败状态的任务')
      return
    }

    if (recipients.length === 0 || amounts.length === 0) {
      message.error('任务数据异常')
      return
    }

    setIsExecuting(true)
    
    // 如果是重新执行失败的任务，先重置状态清除错误信息
    if (task.status === 'FAILED') {
      message.info('正在重新执行失败的转账任务...')
      
      // 先重置任务状态，清除之前的错误信息和交易哈希
      console.log('🔄 重置任务状态，清除错误信息...')
      await BatchTransferApi.updateTaskStatus(task.id, {
        status: TaskStatus.PENDING,
        errorMessage: '',
        txHash: ''
      })
    }

    try {
      // 1. 更新任务状态为执行中
      console.log('🔄 更新任务状态为执行中...')
      await BatchTransferApi.updateTaskStatus(task.id, {
        status: TaskStatus.EXECUTING
      })

      // 2. 执行合约调用
      console.log('🚀 执行合约调用...')
      // 使用后端提供的执行令牌
      const executionToken = task.executionToken
      
      if (!executionToken) {
        console.error('❌ 任务缺少执行令牌')
        message.error('任务缺少执行令牌，无法执行转账')
        return
      }
      
      console.log('📋 合约调用参数详情:', {
        address: contractAddress,
        functionName: 'batchTransfer',
        args: [recipients, amounts, executionToken],
        value: totalValue.toString(),
        chain: chain?.id,
        account: address,
        recipientsCount: recipients.length,
        amountsCount: amounts.length,
        executionToken
      })
      
      // 检查钱包余额
      try {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
        console.log('💰 钱包余额:', {
          balance: balance,
          balanceInEth: parseInt(balance, 16) / 1e18,
          requiredValue: Number(totalValue) / 1e18
        })
      } catch (balanceError) {
        console.warn('⚠️ 无法获取钱包余额:', balanceError)
      }
      
      // 最终检查 - writeContract 调用前
      console.log('🎯 准备调用 writeContract，最终参数:', {
        contractAddress,
        functionName: 'batchTransfer',
        recipients: recipients.length,
        amounts: amounts.length,
        totalValue: totalValue.toString(),
        executionToken,
        writeContractFunction: typeof writeContract,
        isWritePending
      })

      if (typeof writeContract !== 'function') {
        throw new Error('writeContract 函数不可用，请检查 wagmi 配置')
      }

      try {
        // 移除可能干扰钱包确认的参数
        const result = writeContract({
          address: contractAddress as `0x${string}`,
          abi: BATCH_TRANSFER_ABI,
          functionName: 'batchTransfer',
          args: [recipients, amounts, executionToken],
          value: totalValue,
          // 移除 chain 和 account 参数，让 wagmi 自动处理
        })
        
        console.log('✅ writeContract 调用成功提交，应该弹出钱包确认', result)
        
        // 给用户提示
        message.info('请在钱包中确认交易...', 10)
        
      } catch (writeErr: any) {
          console.error('❌ writeContract 调用失败:', writeErr)
          console.error('错误详情:', {
            name: writeErr.name,
            message: writeErr.message,
            code: writeErr.code,
            data: writeErr.data,
            stack: writeErr.stack
          })
          throw writeErr
        }



    } catch (error: any) {
      console.error('❌ 执行转账失败:', error)
      
      try {
        // 回滚任务状态
        await BatchTransferApi.updateTaskStatus(task.id, {
          status: TaskStatus.FAILED,
          errorMessage: error.message || '转账执行失败'
        })
      } catch (updateError) {
        console.error('更新任务状态失败:', updateError)
      }
      
      message.error(`转账失败: ${error.message || '未知错误'}`)
      onError?.(error)
      setIsExecuting(false)
    }
  }

  // 错误处理
  useEffect(() => {
    if (writeError) {
      console.error('合约写入错误:', writeError)
      handleTransactionError(writeError)
    }
  }, [writeError])

  // 添加交易失败监听
  useEffect(() => {
    if (isTransactionError && transactionError && txHash) {
      console.error('❌ 交易执行失败:', transactionError)
      // 解析合约错误信息
      let errorMessage = transactionError.message || '交易执行失败'
      
      // 检查是否是合约 revert 错误
      if (errorMessage.includes('Execution token already used')) {
        errorMessage = '执行令牌已被使用，请刷新页面重试'
      } else if (errorMessage.includes('revert')) {
        // 提取 revert 原因
        const revertMatch = errorMessage.match(/revert (.+)/)
        if (revertMatch) {
          errorMessage = `合约执行失败: ${revertMatch[1]}`
        }
      }
      
      handleTransactionError(new Error(errorMessage))
    }
  }, [isTransactionError, transactionError, txHash])

  const loading = isExecuting || isWritePending || isTransactionLoading
  const canExecute = (task.status === 'PENDING' || task.status === 'FAILED') && !disabled && !loading
  
  // 根据任务状态显示不同的按钮文本
  const getButtonText = () => {
    if (loading) {
      return task.status === 'FAILED' ? '重新执行中...' : '执行中...'
    }
    return task.status === 'FAILED' ? '重新转账' : '执行转账'
  }

  return (
    <Button
      type={task.status === 'FAILED' ? 'default' : 'primary'}
      icon={<PlayCircleOutlined />}
      loading={loading}
      disabled={!canExecute}
      onClick={handleExecuteTransfer}
      danger={task.status === 'FAILED'}
    >
      {getButtonText()}
    </Button>
  )
}

export default ExecuteTransferButton