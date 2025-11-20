import { wormhole, type Network, type Chain } from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';

// Supported networks
export type WormholeNetwork = 'Mainnet' | 'Testnet' | 'Devnet';

// Initialize Wormhole instance
export const createWormholeInstance = async (network: WormholeNetwork = 'Testnet') => {
  return await wormhole(network, [evm, solana]);
};

// Common chain names for easier reference
export const WORMHOLE_CHAINS = {
  // EVM Chains
  ETHEREUM: 'Ethereum' as const,
  SEPOLIA: 'Sepolia' as const,
  BSC: 'Bsc' as const,
  POLYGON: 'Polygon' as const,
  AVALANCHE: 'Avalanche' as const,
  FANTOM: 'Fantom' as const,
  CELO: 'Celo' as const,
  MOONBEAM: 'Moonbeam' as const,
  ARBITRUM: 'Arbitrum' as const,
  OPTIMISM: 'Optimism' as const,
  BASE: 'Base' as const,
  // Solana
  SOLANA: 'Solana' as const,
} as const;

export type WormholeChainName = typeof WORMHOLE_CHAINS[keyof typeof WORMHOLE_CHAINS];

// Chain display names
export const CHAIN_DISPLAY_NAMES: Record<string, string> = {
  Ethereum: 'Ethereum Mainnet',
  Sepolia: 'Sepolia Testnet',
  Bsc: 'BNB Chain',
  Polygon: 'Polygon',
  Avalanche: 'Avalanche',
  Fantom: 'Fantom',
  Celo: 'Celo',
  Moonbeam: 'Moonbeam',
  Arbitrum: 'Arbitrum',
  Optimism: 'Optimism',
  Base: 'Base',
  Solana: 'Solana',
};

// Common token addresses for testing
export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

export const TESTNET_TOKENS: Record<string, TokenInfo[]> = {
  Sepolia: [
    { symbol: 'ETH', address: 'native', decimals: 18 },
    { symbol: 'WETH', address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', decimals: 18 },
  ],
  Avalanche: [
    { symbol: 'AVAX', address: 'native', decimals: 18 },
    { symbol: 'WAVAX', address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c', decimals: 18 },
  ],
  Solana: [
    { symbol: 'SOL', address: 'native', decimals: 9 },
  ],
  Base: [
    { symbol: 'ETH', address: 'native', decimals: 18 },
  ],
  Arbitrum: [
    { symbol: 'ETH', address: 'native', decimals: 18 },
  ],
  Optimism: [
    { symbol: 'ETH', address: 'native', decimals: 18 },
  ],
};

// Helper to get tokens for a chain
export const getTokensForChain = (chain: string): TokenInfo[] => {
  return TESTNET_TOKENS[chain] || [];
};

// Helper to format chain name for display
export const formatChainName = (chain: string): string => {
  return CHAIN_DISPLAY_NAMES[chain] || chain;
};
