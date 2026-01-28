import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, solana, solanaTestnet, solanaDevnet, type AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'

// Get projectId from `https://dashboard.reown.com`
export const projectId = (process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) as string

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, solana, solanaTestnet, solanaDevnet]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }) as any,
  ssr: true,
  projectId,
  networks
})

// Set up Solana Adapter
export const solanaWeb3JsAdapter = new SolanaAdapter({
  // options can be added here if needed
});

export const config = wagmiAdapter.wagmiConfig
