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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Wormhole Bridge
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Cross-chain token transfers powered by Wormhole
            </p>
          </div>

          {/* Test Buttons Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Test Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={testAvalancheToSepolia}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Test: AVAX → Sepolia (Manual)
              </button>
              <button
                onClick={testSepoliaToAvalanche}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Test: Sepolia → AVAX (Auto)
              </button>
              <button
                onClick={testSolanaToSepolia}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Test: SOL → Sepolia
              </button>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Transfer Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Network
                </label>
                <select
                  value={network}
                  onChange={(e) => {
                    setNetwork(e.target.value as WormholeNetwork);
                    setIsInitialized(false);
                  }}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  <option value="Testnet">Testnet</option>
                  <option value="Mainnet">Mainnet</option>
                  <option value="Devnet">Devnet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Transfer Type
                </label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as TransferType)}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  <option value="token">Token Bridge (WTT)</option>
                  <option value="cctp">Circle CCTP (USDC)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Transfer Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={transferMode === 'manual'}
                    onChange={(e) => setTransferMode(e.target.value as TransferMode)}
                    className="mr-2"
                  />
                  <span className="text-white">Manual (requires attestation)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="automatic"
                    checked={transferMode === 'automatic'}
                    onChange={(e) => setTransferMode(e.target.value as TransferMode)}
                    className="mr-2"
                  />
                  <span className="text-white">Automatic (uses relayer)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bridge Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-6">
            <div className="space-y-6">
              {/* From Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  From Chain
                </label>
                <select
                  value={fromChain}
                  onChange={(e) => setFromChain(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  {availableChains.map((chain) => (
                    <option key={chain} value={chain}>
                      {formatChainName(chain)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  From Token
                </label>
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  {getTokensForChain(fromChain).map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Native Gas (for automatic transfers) */}
              {transferMode === 'automatic' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Native Gas Drop-off (optional)
                  </label>
                  <input
                    type="number"
                    value={nativeGas}
                    onChange={(e) => setNativeGas(e.target.value)}
                    placeholder="0.0"
                    step="0.001"
                    className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Amount of native gas to deliver to destination address
                  </p>
                </div>
              )}

              {/* Separator */}
              <div className="flex justify-center">
                <div className="bg-slate-700 p-2 rounded-full">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* To Section */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  To Chain
                </label>
                <select
                  value={toChain}
                  onChange={(e) => setToChain(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  {availableChains.map((chain) => (
                    <option key={chain} value={chain}>
                      {formatChainName(chain)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  To Token
                </label>
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  {getTokensForChain(toChain).map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wallet Address Display */}
              {walletAddress && (
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Connected Wallet</p>
                  <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
                </div>
              )}

              {/* SDK Status */}
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400">Wormhole SDK Status</p>
                <p className={`text-sm font-semibold ${isInitialized ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isInitialized ? `✓ Initialized on ${network}` : 'Initializing...'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleGetChainInfo}
                  disabled={isLoading || !isInitialized}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Chain Info'}
                </button>
                <button
                  onClick={handlePrepareTransfer}
                  disabled={isLoading || !isInitialized || !walletAddress}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Preparing...' : 'Prepare Transfer'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Chain Info Display */}
          {chainInfo && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Chain Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Source Chain</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Name: <span className="text-white">{chainInfo.sourceChain.name}</span></p>
                    <p className="text-slate-300">Chain ID: <span className="text-white">{chainInfo.sourceChain.chainId}</span></p>
                    <p className="text-slate-300">RPC: <span className="text-white font-mono text-xs">{chainInfo.sourceChain.rpc}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-pink-400 mb-2">Destination Chain</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Name: <span className="text-white">{chainInfo.destinationChain.name}</span></p>
                    <p className="text-slate-300">Chain ID: <span className="text-white">{chainInfo.destinationChain.chainId}</span></p>
                    <p className="text-slate-300">RPC: <span className="text-white font-mono text-xs">{chainInfo.destinationChain.rpc}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Execution Status */}
          {executionStatus && (
            <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-4 rounded-lg mb-6">
              <p className="font-semibold mb-2">Transfer Details:</p>
              <pre className="text-xs bg-slate-900 p-4 rounded overflow-auto">
                {executionStatus}
              </pre>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-purple-500/10 border border-purple-500 text-purple-300 p-4 rounded-lg">
            <p className="font-semibold mb-2">ℹ️ Implementation Note:</p>
            <p className="text-sm">
              This page demonstrates the Wormhole SDK integration with basic functionality.
              The SDK is successfully initialized and can retrieve chain information and prepare
              transfer parameters. To complete the full transfer implementation, you'll need to:
            </p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Integrate wallet signing capabilities (Privy/Web3 wallet)</li>
              <li>Implement the transfer initiation logic</li>
              <li>Add VAA (Verified Action Approval) fetching for manual transfers</li>
              <li>Implement transfer completion on the destination chain</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
