// 合约地址配置
export const CONTRACT_ADDRESSES = {
  BatchTransfer: {
    // Sepolia测试网
    11155111: '0x3143c06a240f3AFe62Fd2ab4Ce3d342Bc40106d3',
    // 主网（待部署）
    1: '',
  },
} as const

// 支持的网络
export const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111,
  MAINNET: 1,
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
      {"name": "_amounts", "type": "uint256[]", "internalType": "uint256[]"}
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
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "fallback",
    "stateMutability": "payable"
  }
] as const 