'use client';

import './globals.css'
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { privyConfig, scrollSepoliaChain } from '@/lib/reown-config';
import { http } from 'viem';
import { createConfig } from 'wagmi';
import Navbar from '@/components/Navbar';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [scrollSepoliaChain as any],
  transports: {
    [scrollSepoliaChain.id]: http(),
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PrivyProvider
          appId={privyConfig.appId}
          config={privyConfig.config}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              <Navbar />
              {children}
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}
