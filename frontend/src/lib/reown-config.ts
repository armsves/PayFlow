import { scrollSepolia } from 'viem/chains';

export const scrollSepoliaChain = {
  ...scrollSepolia,
  id: 534351,
  name: 'Scroll Sepolia',
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io/']
    },
    public: {
      http: ['https://sepolia-rpc.scroll.io/']
    }
  }
};

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  config: {
    appearance: {
      theme: 'dark' as const,
      accentColor: '#3b82f6' as `#${string}`,
    },
    defaultChain: scrollSepoliaChain,
    supportedChains: [scrollSepoliaChain],
  }
};
