import { createConfig, EVM, config } from '@lifi/sdk';
import { createConfig as createWagmiConfig } from 'wagmi';
import { http, createWalletClient, custom, type Address } from 'viem';
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

// Configure LI.FI providers with wallet client
export const configureLiFiProviders = async (
  walletAddress: Address,
  ethereumProvider: any,
  chainId: number
) => {
  const chainMap: Record<number, any> = {
    [SUPPORTED_CHAINS.ARBITRUM]: arbitrum,
    [SUPPORTED_CHAINS.OPTIMISM]: optimism,
    [SUPPORTED_CHAINS.BASE]: base,
    [SUPPORTED_CHAINS.POLYGON]: polygon,
    [SUPPORTED_CHAINS.MAINNET]: mainnet,
  };

  const chain = chainMap[chainId] || arbitrum;

  // Create wallet client
  const walletClient = createWalletClient({
    account: walletAddress,
    chain,
    transport: custom(ethereumProvider),
  });

  // Get LI.FI config and set EVM provider
  const evmProvider = EVM({
    getWalletClient: async () => walletClient,
    switchChain: async (requiredChainId: number) => {
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
      });

      return createWalletClient({
        account: walletAddress,
        chain: chainMap[requiredChainId] || chain,
        transport: custom(ethereumProvider),
      });
    },
  });

  config.setProviders([evmProvider]);

  return evmProvider;
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
