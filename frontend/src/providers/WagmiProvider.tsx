import React, { ReactNode } from 'react'
import { WagmiConfig, createConfig, configureChains, mainnet, sepolia } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

interface WagmiProviderProps {
  children: ReactNode
}

// 配置支持的链
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    sepolia, // 测试网
  ],
  [
    // 优先使用Alchemy（如果有API key）
    alchemyProvider({ 
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || 'demo' 
    }),
    // 备用Infura
    infuraProvider({ 
      apiKey: import.meta.env.VITE_INFURA_API_KEY || 'demo' 
    }),
    // 公共提供商作为最后备选
    publicProvider(),
  ]
)

// 配置钱包连接器
const { wallets } = getDefaultWallets({
  appName: 'ETH批量转账系统',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: '其他',
    wallets: [
      {
        id: 'injected',
        name: '注入式钱包',
        iconUrl: 'https://avatars.githubusercontent.com/u/37784886',
        iconBackground: '#fff',
        createConnector: () => ({
          connector: new InjectedConnector({ chains }),
        }),
      },
    ],
  },
])

// 创建Wagmi配置
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

// RainbowKit主题配置
const rainbowKitTheme = {
  blurs: {
    modalOverlay: 'blur(4px)',
  },
  colors: {
    accentColor: '#1890ff',
    accentColorForeground: '#fff',
    actionButtonBorder: 'rgba(255, 255, 255, 0.04)',
    actionButtonBorderMobile: 'rgba(255, 255, 255, 0.08)',
    actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
    closeButton: 'rgba(224, 232, 255, 0.6)',
    closeButtonBackground: 'rgba(255, 255, 255, 0.08)',
    connectButtonBackground: '#1890ff',
    connectButtonBackgroundError: '#ff4d4f',
    connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))',
    connectButtonText: '#fff',
    connectButtonTextError: '#fff',
    connectionIndicator: '#30e000',
    downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #1a1b1f',
    downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #1a1b1f',
    error: '#ff4d4f',
    generalBorder: 'rgba(255, 255, 255, 0.08)',
    generalBorderDim: 'rgba(255, 255, 255, 0.04)',
    menuItemBackground: 'rgba(224, 232, 255, 0.1)',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#fff',
    modalBorder: 'rgba(255, 255, 255, 0.08)',
    modalText: '#1f2937',
    modalTextDim: '#6b7280',
    modalTextSecondary: '#9ca3af',
    profileAction: 'rgba(224, 232, 255, 0.1)',
    profileActionHover: 'rgba(224, 232, 255, 0.2)',
    profileForeground: '#fff',
    selectedOptionBorder: '#1890ff',
    standby: '#ffa500',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  radii: {
    actionButton: '6px',
    connectButton: '6px',
    menuButton: '6px',
    modal: '8px',
    modalMobile: '8px',
  },
  shadows: {
    connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
    selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
    selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
  },
}

export const WagmiProvider: React.FC<WagmiProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        theme={rainbowKitTheme}
        modalSize="compact"
        coolMode
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default WagmiProvider