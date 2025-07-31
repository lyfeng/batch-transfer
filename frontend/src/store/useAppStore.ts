import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'

export interface TaskItem {
  address: string
  amount: number
}

export interface Task {
  id: number
  taskName: string
  totalRecipients: number
  totalAmount: number
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED'
  txHash?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
  transferItems?: Array<{
    id: number
    recipientAddress: string
    amount: number
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    createdAt: string
  }>
}

interface AppState {
  // UI状态
  sidebarCollapsed: boolean
  loading: boolean
  
  // 任务管理
  tasks: Task[]
  currentTask: Task | null
  
  // 创建任务表单
  createTaskForm: {
    taskName: string
    transferItems: TaskItem[]
  }
  
  // 钱包连接状态
  wallet: {
    connected: boolean
    address?: string
    balance?: string
    chainId?: number
  }
  
  // 区块链状态
  blockchain: {
    currentBlock?: number
    connected: boolean
  }
}

interface AppActions {
  // UI操作
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
  
  // 任务操作
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  setCurrentTask: (task: Task | null) => void
  
  // 创建任务表单操作
  setTaskName: (name: string) => void
  addTransferItem: (item: TaskItem) => void
  removeTransferItem: (index: number) => void
  updateTransferItem: (index: number, item: TaskItem) => void
  clearCreateTaskForm: () => void
  setTransferItems: (items: TaskItem[]) => void
  
  // 钱包操作
  setWalletConnected: (connected: boolean, address?: string) => void
  setWalletBalance: (balance: string) => void
  setWalletChainId: (chainId: number) => void
  
  // 区块链状态
  setBlockchainStatus: (connected: boolean, currentBlock?: number) => void
}

type AppStore = AppState & AppActions

const initialState: AppState = {
  sidebarCollapsed: false,
  loading: false,
  tasks: [],
  currentTask: null,
  createTaskForm: {
    taskName: '',
    transferItems: []
  },
  wallet: {
    connected: false
  },
  blockchain: {
    connected: false
  }
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,
      
      // UI操作
      toggleSidebar: () => set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed
      }),
      
      setLoading: (loading: boolean) => set((state) => {
        state.loading = loading
      }),
      
      // 任务操作
      setTasks: (tasks: Task[]) => set((state) => {
        state.tasks = tasks
      }),
      
      addTask: (task: Task) => set((state) => {
        state.tasks.unshift(task)
      }),
      
      updateTask: (id: number, updates: Partial<Task>) => set((state) => {
        const index = state.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          Object.assign(state.tasks[index], updates)
        }
        
        // 同时更新当前任务
        if (state.currentTask?.id === id) {
          Object.assign(state.currentTask, updates)
        }
      }),
      
      setCurrentTask: (task: Task | null) => set((state) => {
        state.currentTask = task
      }),
      
      // 创建任务表单操作
      setTaskName: (name: string) => set((state) => {
        state.createTaskForm.taskName = name
      }),
      
      addTransferItem: (item: TaskItem) => set((state) => {
        state.createTaskForm.transferItems.push(item)
      }),
      
      removeTransferItem: (index: number) => set((state) => {
        state.createTaskForm.transferItems.splice(index, 1)
      }),
      
      updateTransferItem: (index: number, item: TaskItem) => set((state) => {
        if (index >= 0 && index < state.createTaskForm.transferItems.length) {
          state.createTaskForm.transferItems[index] = item
        }
      }),
      
      setTransferItems: (items: TaskItem[]) => set((state) => {
        state.createTaskForm.transferItems = items
      }),
      
      clearCreateTaskForm: () => set((state) => {
        state.createTaskForm = {
          taskName: '',
          transferItems: []
        }
      }),
      
      // 钱包操作
      setWalletConnected: (connected: boolean, address?: string) => set((state) => {
        state.wallet.connected = connected
        state.wallet.address = address
        if (!connected) {
          state.wallet.balance = undefined
          state.wallet.chainId = undefined
        }
      }),
      
      setWalletBalance: (balance: string) => set((state) => {
        state.wallet.balance = balance
      }),
      
      setWalletChainId: (chainId: number) => set((state) => {
        state.wallet.chainId = chainId
      }),
      
      // 区块链状态
      setBlockchainStatus: (connected: boolean, currentBlock?: number) => set((state) => {
        state.blockchain.connected = connected
        state.blockchain.currentBlock = currentBlock
      }),
    }))
  )
)

// 选择器
export const selectTasks = (state: AppStore) => state.tasks
export const selectCurrentTask = (state: AppStore) => state.currentTask
export const selectCreateTaskForm = (state: AppStore) => state.createTaskForm
export const selectWallet = (state: AppStore) => state.wallet
export const selectLoading = (state: AppStore) => state.loading
export const selectSidebarCollapsed = (state: AppStore) => state.sidebarCollapsed
