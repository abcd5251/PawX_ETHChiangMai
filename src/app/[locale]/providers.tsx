'use client';

import type { ReactNode } from 'react';
import { WebSocketProvider } from '@/contexts/WebSocketProvider';
import { wagmiAdapter, projectId, networks, solanaWeb3JsAdapter } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import * as React from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

// Set up metadata
const metadata = {
  name: 'PawX',
  description: 'PawX Application',
  url: 'https://pawx.app', // Update this to your actual domain
  icons: ['https://pawx.app/favicon.jpg'] // Update this
}

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: metadata,
  features: {
    analytics: true
  }
})

export function Providers({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [queryClient] = useState(() => new QueryClient());

  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
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
    </WagmiProvider>
  );
}
