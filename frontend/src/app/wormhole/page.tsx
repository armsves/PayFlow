'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { Wormhole, type ChainAddress } from '@wormhole-foundation/sdk';
import {
  createWormholeInstance,
  CHAIN_DISPLAY_NAMES,
  getTokensForChain,
  formatChainName,
  type WormholeNetwork,
  type TokenInfo,
} from '@/lib/wormhole-config';
import { parseUnits, formatUnits } from 'viem';

type TransferType = 'token' | 'cctp';
type TransferMode = 'manual' | 'automatic';

export default function WormholePage() {
  const { wallets } = useWallets();

  // Wormhole instance
  const [wh, setWh] = useState<Wormhole<WormholeNetwork> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Form state
  const [network, setNetwork] = useState<WormholeNetwork>('Testnet');
  const [transferType, setTransferType] = useState<TransferType>('token');
  const [transferMode, setTransferMode] = useState<TransferMode>('manual');

  const [fromChain, setFromChain] = useState<string>('Avalanche');
  const [toChain, setToChain] = useState<string>('Sepolia');
  const [fromToken, setFromToken] = useState<string>('native');
  const [toToken, setToToken] = useState<string>('native');
  const [amount, setAmount] = useState<string>('0.01');
  const [nativeGas, setNativeGas] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Results state
  const [chainInfo, setChainInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [executionStatus, setExecutionStatus] = useState<string>('');

  // Available chains based on network
  const availableChains = Object.keys(CHAIN_DISPLAY_NAMES);

  // Initialize Wormhole SDK
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const instance = await createWormholeInstance(network);
        setWh(instance);
        setIsInitialized(true);
        console.log('Wormhole SDK initialized for', network);
      } catch (err) {
        console.error('Failed to initialize Wormhole:', err);
        setError('Failed to initialize Wormhole SDK');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      init();
    }
  }, [network, isInitialized]);

  // Get wallet address
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      if (embeddedWallet?.address) {
        setWalletAddress(embeddedWallet.address);
      }
    }
  }, [wallets]);

  // Get token info helper
  const getTokenInfo = (chain: string, tokenAddress: string): TokenInfo | undefined => {
    const tokens = getTokensForChain(chain);
    return tokens.find(t => t.address === tokenAddress);
  };

  // Get chain information
  const handleGetChainInfo = async () => {
    if (!wh) {
      setError('Wormhole not initialized');
      return;
    }

    setIsLoading(true);
    setError('');
    setChainInfo(null);

    try {
      const srcChain = wh.getChain(fromChain as any);
      const dstChain = wh.getChain(toChain as any);

      const info = {
        sourceChain: {
          name: fromChain,
          chainId: srcChain.config.chainId,
          rpc: srcChain.config.rpc,
        },
        destinationChain: {
          name: toChain,
          chainId: dstChain.config.chainId,
          rpc: dstChain.config.rpc,
        },
      };

      setChainInfo(info);
      console.log('Chain information:', info);
    } catch (err: any) {
      console.error('Error getting chain info:', err);
      setError(err.message || 'Failed to get chain information');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare transfer (demonstrate SDK usage)
  const handlePrepareTransfer = async () => {
    if (!wh || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setExecutionStatus('');

    try {
      const fromTokenInfo = getTokenInfo(fromChain, fromToken);
      if (!fromTokenInfo) {
        throw new Error('Invalid from token');
      }

      const amountInBaseUnits = parseUnits(amount, fromTokenInfo.decimals);

      // Create token ID
      const tokenId = Wormhole.tokenId(fromChain as any, fromToken);

      // Create chain addresses
      const sourceAddress: ChainAddress = Wormhole.chainAddress(
        fromChain as any,
        walletAddress
      );
      const destAddress: ChainAddress = Wormhole.chainAddress(
        toChain as any,
        walletAddress
      );

      const transferInfo = {
        tokenId,
        amount: amountInBaseUnits.toString(),
        sourceChain: fromChain,
        destinationChain: toChain,
        sourceAddress: sourceAddress.address.toString(),
        destinationAddress: destAddress.address.toString(),
        transferType,
        transferMode,
      };

      setExecutionStatus(JSON.stringify(transferInfo, null, 2));
      console.log('Transfer prepared:', transferInfo);

      // In a real implementation, you would create the transfer here:
      // const transfer = await wh.tokenTransfer(...) or wh.circleTransfer(...)
      // Then initiate it with: await transfer.initiateTransfer(signer)

    } catch (err: any) {
      console.error('Error preparing transfer:', err);
      setError(err.message || 'Failed to prepare transfer');
    } finally {
      setIsLoading(false);
    }
  };

  // Test scenarios
  const testAvalancheToSepolia = () => {
    setFromChain('Avalanche');
    setToChain('Sepolia');
    setFromToken('native');
    setToToken('native');
    setAmount('0.01');
    setTransferType('token');
    setTransferMode('manual');
  };

  const testSepoliaToAvalanche = () => {
    setFromChain('Sepolia');
    setToChain('Avalanche');
    setFromToken('native');
    setToToken('native');
    setAmount('0.005');
    setTransferType('token');
    setTransferMode('automatic');
  };

  const testSolanaToSepolia = () => {
    setFromChain('Solana');
    setToChain('Sepolia');
    setFromToken('native');
    setToToken('native');
    setAmount('0.1');
    setTransferType('token');
    setTransferMode('manual');
  };

  return (
    <main className="min-h-screen pb-20 relative">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none blur-[120px] bg-pink-600/40"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-20 pointer-events-none blur-[120px] bg-purple-600/40"></div>

      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight text-white">
              Wormhole Bridge
            </h1>
            <p className="text-blue-200/60 text-sm sm:text-base md:text-lg max-w-lg mx-auto px-4">
              Cross-chain token transfers powered by Wormhole
            </p>
          </div>

          {/* Test Buttons Section */}
          <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-lg sm:text-xl">🧪</span> Quick Test Scenarios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={testAvalancheToSepolia}
                className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
              >
                AVAX → Sepolia (Manual)
              </button>
              <button
                onClick={testSepoliaToAvalanche}
                className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20"
              >
                Sepolia → AVAX (Auto)
              </button>
              <button
                onClick={testSolanaToSepolia}
                className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
              >
                SOL → Sepolia
              </button>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Transfer Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                  Network
                </label>
                <select
                  value={network}
                  onChange={(e) => {
                    setNetwork(e.target.value as WormholeNetwork);
                    setIsInitialized(false);
                  }}
                  className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                >
                  <option value="Testnet" className="bg-slate-900">Testnet</option>
                  <option value="Mainnet" className="bg-slate-900">Mainnet</option>
                  <option value="Devnet" className="bg-slate-900">Devnet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                  Transfer Type
                </label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as TransferType)}
                  className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                >
                  <option value="token" className="bg-slate-900">Token Bridge (WTT)</option>
                  <option value="cctp" className="bg-slate-900">Circle CCTP (USDC)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                Transfer Mode
              </label>
              <div className="flex gap-2 sm:gap-4 bg-black/20 p-1.5 sm:p-2 rounded-xl inline-flex border border-white/5 w-full sm:w-auto">
                <button
                   onClick={() => setTransferMode('manual')}
                   className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
                     transferMode === 'manual'
                       ? 'bg-white/10 text-white shadow-lg'
                       : 'text-blue-200/40 hover:text-white'
                   }`}
                >
                  Manual
                </button>
                <button
                   onClick={() => setTransferMode('automatic')}
                   className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${
                     transferMode === 'automatic'
                       ? 'bg-white/10 text-white shadow-lg'
                       : 'text-blue-200/40 hover:text-white'
                   }`}
                >
                  Automatic
                </button>
              </div>
            </div>
          </div>

          {/* Bridge Form */}
          <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 relative overflow-hidden">
            <div className="relative z-10 space-y-6 sm:space-y-8">
              {/* From Section */}
              <div className="bg-black/20 rounded-2xl p-4 sm:p-6 border border-white/5">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <span className="text-xs uppercase tracking-widest text-pink-200/50 font-bold">From</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Chain
                    </label>
                    <select
                      value={fromChain}
                      onChange={(e) => setFromChain(e.target.value)}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                    >
                      {availableChains.map((chain) => (
                        <option key={chain} value={chain} className="bg-slate-900">
                          {formatChainName(chain)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Token
                    </label>
                    <select
                      value={fromToken}
                      onChange={(e) => setFromToken(e.target.value)}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                    >
                      {getTokensForChain(fromChain).map((token) => (
                        <option key={token.address} value={token.address} className="bg-slate-900">
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      step="0.001"
                      className="glass-input w-full pl-3 sm:pl-4 pr-12 sm:pr-16 py-3 sm:py-4 text-xl sm:text-2xl font-light text-white placeholder-white/10 bg-transparent border-none focus:ring-0 focus:bg-white/5 transition-colors"
                    />
                  </div>
                </div>

                {/* Native Gas (for automatic transfers) */}
                {transferMode === 'automatic' && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5">
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Native Gas Drop-off (optional)
                    </label>
                    <input
                      type="number"
                      value={nativeGas}
                      onChange={(e) => setNativeGas(e.target.value)}
                      placeholder="0.0"
                      step="0.001"
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white"
                    />
                    <p className="text-[10px] sm:text-xs text-blue-200/40 mt-2">
                      Amount of native gas to deliver to destination address
                    </p>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="flex justify-center -my-4 sm:-my-6 relative z-20">
                 <div className="glass-panel p-2 sm:p-3 rounded-full shadow-lg border-white/20 bg-slate-900">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* To Section */}
              <div className="bg-black/20 rounded-2xl p-4 sm:p-6 border border-white/5 pt-6 sm:pt-8">
                 <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <span className="text-xs uppercase tracking-widest text-purple-200/50 font-bold">To</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Chain
                    </label>
                    <select
                      value={toChain}
                      onChange={(e) => setToChain(e.target.value)}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                    >
                      {availableChains.map((chain) => (
                        <option key={chain} value={chain} className="bg-slate-900">
                          {formatChainName(chain)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Token
                    </label>
                    <select
                      value={toToken}
                      onChange={(e) => setToToken(e.target.value)}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                    >
                      {getTokensForChain(toChain).map((token) => (
                        <option key={token.address} value={token.address} className="bg-slate-900">
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Wallet Address Display */}
              {walletAddress && (
                <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-blue-200/60 break-all">Connected: <span className="text-white font-mono ml-1 sm:ml-2">{walletAddress}</span></p>
                </div>
              )}

              {/* SDK Status */}
              <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <p className="text-xs sm:text-sm text-blue-200/60">Wormhole SDK Status</p>
                <p className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${isInitialized ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isInitialized ? (
                    <>✓ Initialized on {network}</>
                  ) : (
                    <>⟳ Initializing...</>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={handleGetChainInfo}
                  disabled={isLoading || !isInitialized}
                  className="glass-button py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white shadow-lg bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Chain Info'}
                </button>
                <button
                  onClick={handlePrepareTransfer}
                  disabled={isLoading || !isInitialized || !walletAddress}
                  className="glass-button py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white shadow-lg bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500 hover:to-emerald-500 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Preparing...' : 'Prepare Transfer'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="glass-panel p-6 border-l-4 border-red-500 bg-red-500/10 mb-6">
              <p className="font-semibold text-red-200">Error</p>
              <p className="text-red-200/70 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Chain Info Display */}
          {chainInfo && (
            <div className="glass-panel p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold text-white mb-6">Chain Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-black/20 p-6 rounded-2xl border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4 border-b border-white/5 pb-2">Source Chain</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-blue-200/60">Name</span>
                        <span className="text-white font-medium">{chainInfo.sourceChain.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200/60">Chain ID</span>
                        <span className="text-white font-mono">{chainInfo.sourceChain.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200/60">RPC</span>
                        <span className="text-white/50 font-mono text-xs truncate max-w-[150px]">{chainInfo.sourceChain.rpc}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-pink-500/20">
                  <h3 className="text-lg font-semibold text-pink-400 mb-4 border-b border-white/5 pb-2">Destination Chain</h3>
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                        <span className="text-blue-200/60">Name</span>
                        <span className="text-white font-medium">{chainInfo.destinationChain.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200/60">Chain ID</span>
                        <span className="text-white font-mono">{chainInfo.destinationChain.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-200/60">RPC</span>
                        <span className="text-white/50 font-mono text-xs truncate max-w-[150px]">{chainInfo.destinationChain.rpc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Execution Status */}
          {executionStatus && (
            <div className="glass-panel p-6 border-l-4 border-blue-500 bg-blue-500/10 mb-6">
              <p className="font-semibold text-blue-200 mb-4">Transfer Details</p>
              <pre className="text-[10px] bg-black/40 p-4 rounded-xl overflow-auto text-blue-200/60 font-mono border border-white/5">
                {executionStatus}
              </pre>
            </div>
          )}

          {/* Info Box */}
          <div className="glass-panel p-6 border border-purple-500/30 bg-purple-500/5">
            <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                    <p className="font-semibold text-purple-200 mb-2">Implementation Note</p>
                    <p className="text-sm text-purple-200/70 mb-2 leading-relaxed">
                    This page demonstrates the Wormhole SDK integration with basic functionality.
                    The SDK is successfully initialized and can retrieve chain information and prepare
                    transfer parameters. To complete the full transfer implementation, you'll need to:
                    </p>
                    <ul className="list-disc list-inside text-sm text-purple-200/60 space-y-1 ml-2">
                    <li>Integrate wallet signing capabilities (Privy/Web3 wallet)</li>
                    <li>Implement the transfer initiation logic</li>
                    <li>Add VAA (Verified Action Approval) fetching for manual transfers</li>
                    <li>Implement transfer completion on the destination chain</li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
