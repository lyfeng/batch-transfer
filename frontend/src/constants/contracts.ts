// 合约地址配置
export const CONTRACT_ADDRESSES = {
  BatchTransfer: {
    // Sepolia测试网
    11155111: '0x865DA7605d93958c55102c3C4E76b8C535427EE8',
    // 主网/Tenderly（共享链ID 1）
    1: '0x3143c06a240f3AFe62Fd2ab4Ce3d342Bc40106d3', // Tenderly合约地址
  },
} as const

// 支持的网络
export const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111,
  MAINNET: 1, // 主网和Tenderly共享此ID
} as const

// Tenderly 专用配置
export const TENDERLY_RPC = 'https://virtual.mainnet.us-west.rpc.tenderly.co/697808de-4372-4815-b964-84394e11796e'

// 动态RPC配置
const getMainnetRPC = () => {
  // 如果设置了Tenderly RPC，使用Tenderly
  if (import.meta.env.VITE_USE_TENDERLY === 'true') {
    return TENDERLY_RPC
  }
  // 否则使用真实主网
  return import.meta.env.VITE_MAINNET_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY'
}

// RPC 端点配置
export const RPC_URLS = {
  [SUPPORTED_CHAINS.MAINNET]: getMainnetRPC(),
  [SUPPORTED_CHAINS.SEPOLIA]: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY',
} as const

// 检查是否使用Tenderly
export const isUsingTenderly = () => import.meta.env.VITE_USE_TENDERLY === 'true'

// 网络名称映射
export const CHAIN_NAMES = {
  [SUPPORTED_CHAINS.MAINNET]: isUsingTenderly() ? 'Tenderly Virtual Network' : 'Ethereum Mainnet',
  [SUPPORTED_CHAINS.SEPOLIA]: 'Sepolia Testnet',
} as const

// 获取当前网络的合约地址
export const getContractAddress = (chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES) => {
  return CONTRACT_ADDRESSES[contractName][chainId as keyof typeof CONTRACT_ADDRESSES[typeof contractName]]
}

// BatchTransfer合约ABI（从编译输出中获取）
export const BATCH_TRANSFER_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "MAX_RECIPIENTS",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "batchTransfer",
    "inputs": [
      {"name": "_recipients", "type": "address[]", "internalType": "address[]"},
      {"name": "_amounts", "type": "uint256[]", "internalType": "uint256[]"},
      {"name": "_executionToken", "type": "string", "internalType": "string"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "emergencyWithdraw",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "estimateGas",
    "inputs": [
      {"name": "_recipients", "type": "address[]", "internalType": "address[]"},
      {"name": "_amounts", "type": "uint256[]", "internalType": "uint256[]"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getUserStats",
    "inputs": [{"name": "_user", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isExecutionTokenUsed",
    "inputs": [{"name": "_executionToken", "type": "string", "internalType": "string"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "executionTokens",
    "inputs": [{"name": "", "type": "string", "internalType": "string"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "totalTransactions",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [{"name": "newOwner", "type": "address", "internalType": "address"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "userTransactionCount",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "BatchTransferCompleted",
    "inputs": [
      {"name": "caller", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "totalAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "successCount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "failureCount", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BatchTransferInitiated",
    "inputs": [
      {"name": "caller", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "totalAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "numRecipients", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {"name": "previousOwner", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "newOwner", "type": "address", "indexed": true, "internalType": "address"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SingleTransferResult",
    "inputs": [
      {"name": "recipient", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "success", "type": "bool", "indexed": false, "internalType": "bool"},
      {"name": "message", "type": "string", "indexed": false, "internalType": "string"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ExecutionTokenUsed",
    "inputs": [
      {"name": "executionToken", "type": "string", "indexed": true, "internalType": "string"},
      {"name": "caller", "type": "address", "indexed": true, "internalType": "address"}
    ],
    "anonymous": false
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "fallback",
    "stateMutability": "payable"
  }
] as const