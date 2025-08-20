/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ALCHEMY_API_KEY: string
  readonly VITE_MAINNET_RPC_URL: string
  readonly VITE_SEPOLIA_RPC_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_ENABLE_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}