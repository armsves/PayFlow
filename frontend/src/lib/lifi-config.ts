import { createConfig, EVM } from '@lifi/sdk';
import { createConfig as createWagmiConfig } from 'wagmi';
import { http } from 'viem';
import { mainnet, optimism, arbitrum, polygon, base } from 'viem/chains';
import { scrollSepoliaChain } from './reown-config';

// Create wagmi config for LI.FI (supporting multiple chains)
export const lifiWagmiConfig = createWagmiConfig({
  chains: [
    scrollSepoliaChain as any,
    mainnet,
    optimism,
    arbitrum,
    polygon,
    base,
  ],
  transports: {
    [scrollSepoliaChain.id]: http(process.env.NEXT_PUBLIC_SCROLL_SEPOLIA_RPC_URL),
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});

// Initialize LI.FI SDK configuration
export const initializeLiFi = () => {
  createConfig({
    integrator: 'PayFlow',
    // Add custom RPC URLs for better performance
    rpcUrls: {
      [scrollSepoliaChain.id]: [
        process.env.NEXT_PUBLIC_SCROLL_SEPOLIA_RPC_URL || 'https://sepolia-rpc.scroll.io/',
      ],
    },
    // Default route options
    routeOptions: {
      slippage: 0.005, // 0.5% slippage
      order: 'RECOMMENDED', // Get the best recommended routes
      allowSwitchChain: true, // Allow chain switching
    },
  });
};

// Common chain IDs for the UI
export const SUPPORTED_CHAINS = {
  SCROLL_SEPOLIA: scrollSepoliaChain.id,
  MAINNET: mainnet.id,
  OPTIMISM: optimism.id,
  ARBITRUM: arbitrum.id,
  POLYGON: polygon.id,
  BASE: base.id,
} as const;

export const CHAIN_NAMES: Record<number, string> = {
  [SUPPORTED_CHAINS.SCROLL_SEPOLIA]: 'Scroll Sepolia',
  [SUPPORTED_CHAINS.MAINNET]: 'Ethereum',
  [SUPPORTED_CHAINS.OPTIMISM]: 'Optimism',
  [SUPPORTED_CHAINS.ARBITRUM]: 'Arbitrum',
  [SUPPORTED_CHAINS.POLYGON]: 'Polygon',
  [SUPPORTED_CHAINS.BASE]: 'Base',
};
