'use client';

import type { ReactNode } from 'react';
import { WebSocketProvider } from '@/contexts/WebSocketProvider';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  DynamicContextProvider, 
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: ReactNode; cookies: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "ba7db7a5-fc43-433b-98e8-6fc0ab00e312";

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: ['https://bscscan.com'],
              chainId: 56,
              chainName: 'BNB Smart Chain',
              iconUrls: ['https://raw.githubusercontent.com/dynamic-labs/sdk/main/packages/icons/img/networks/bnb.svg'],
              name: 'BNB Smart Chain',
              nativeCurrency: {
                decimals: 18,
                name: 'BNB',
                symbol: 'BNB',
              },
              networkId: 56,
              rpcUrls: ['https://bsc-dataseed.binance.org'],
              vanityName: 'BSC',
            },
          ],
        }
      }}
      theme="auto"
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <WebSocketProvider>
            {mounted && children}
          </WebSocketProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </DynamicContextProvider>
  );
}
