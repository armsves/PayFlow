'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import {
  getRoutes,
  getQuote,
  executeRoute,
  getChains,
  getTokens,
  type Route,
  type QuoteRequest,
  type RoutesRequest,
} from '@lifi/sdk';
import { initializeLiFi, SUPPORTED_CHAINS, CHAIN_NAMES } from '@/lib/lifi-config';
import { formatUnits, parseUnits } from 'viem';

// Common token addresses for testing
const COMMON_TOKENS: Record<number, Array<{ address: string; symbol: string; decimals: number }>> = {
  [SUPPORTED_CHAINS.ARBITRUM]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', symbol: 'USDC', decimals: 6 },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', decimals: 6 },
  ],
  [SUPPORTED_CHAINS.OPTIMISM]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', symbol: 'USDC', decimals: 6 },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', decimals: 18 },
  ],
  [SUPPORTED_CHAINS.BASE]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', decimals: 18 },
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 },
  ],
  [SUPPORTED_CHAINS.POLYGON]: [
    { address: '0x0000000000000000000000000000000000000000', symbol: 'MATIC', decimals: 18 },
    { address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', symbol: 'USDC', decimals: 6 },
  ],
};

export default function BridgePage() {
  const { wallets } = useWallets();
  const [isInitialized, setIsInitialized] = useState(false);

  // Form state
  const [fromChain, setFromChain] = useState<number>(SUPPORTED_CHAINS.ARBITRUM);
  const [toChain, setToChain] = useState<number>(SUPPORTED_CHAINS.OPTIMISM);
  const [fromToken, setFromToken] = useState<string>('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'); // USDC on Arbitrum
  const [toToken, setToToken] = useState<string>('0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'); // USDC on Optimism
  const [amount, setAmount] = useState<string>('10');
  const [walletAddress, setWalletAddress] = useState<string>('');

  // Results state
  const [quote, setQuote] = useState<any>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [executionStatus, setExecutionStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  // Initialize LI.FI SDK
  useEffect(() => {
    if (!isInitialized) {
      try {
        initializeLiFi();
        setIsInitialized(true);
        console.log('LI.FI SDK initialized');
      } catch (err) {
        console.error('Failed to initialize LI.FI:', err);
        setError('Failed to initialize LI.FI SDK');
      }
    }
  }, [isInitialized]);

  // Get wallet address
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      if (embeddedWallet?.address) {
        setWalletAddress(embeddedWallet.address);
      }
    }
  }, [wallets]);

  const handleGetQuote = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuote(null);

    try {
      const fromTokenInfo = COMMON_TOKENS[fromChain]?.find(t => t.address === fromToken);
      if (!fromTokenInfo) {
        throw new Error('Invalid from token');
      }

      const amountInWei = parseUnits(amount, fromTokenInfo.decimals).toString();

      const quoteRequest: QuoteRequest = {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount: amountInWei,
        fromAddress: walletAddress,
      };

      console.log('Requesting quote:', quoteRequest);
      const result = await getQuote(quoteRequest);
      setQuote(result);
      console.log('Quote received:', result);
    } catch (err: any) {
      console.error('Error getting quote:', err);
      setError(err.message || 'Failed to get quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRoutes = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');
    setRoutes([]);

    try {
      const fromTokenInfo = COMMON_TOKENS[fromChain]?.find(t => t.address === fromToken);
      if (!fromTokenInfo) {
        throw new Error('Invalid from token');
      }

      const amountInWei = parseUnits(amount, fromTokenInfo.decimals).toString();

      const routesRequest: RoutesRequest = {
        fromChainId: fromChain,
        toChainId: toChain,
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        fromAmount: amountInWei,
        fromAddress: walletAddress,
      };

      console.log('Requesting routes:', routesRequest);
      const result = await getRoutes(routesRequest);
      setRoutes(result.routes);
      if (result.routes.length > 0) {
        setSelectedRoute(result.routes[0]);
      }
      console.log('Routes received:', result.routes);
    } catch (err: any) {
      console.error('Error getting routes:', err);
      setError(err.message || 'Failed to get routes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteRoute = async () => {
    if (!selectedRoute) {
      setError('No route selected');
      return;
    }

    setIsLoading(true);
    setError('');
    setExecutionStatus('Executing route...');
    setTxHash('');

    try {
      const executedRoute = await executeRoute(selectedRoute, {
        updateRouteHook: (updatedRoute) => {
          console.log('Route update:', updatedRoute);

          // Extract transaction hash if available
          updatedRoute.steps.forEach((step) => {
            step.execution?.process.forEach((process) => {
              if (process.txHash) {
                setTxHash(process.txHash);
                setExecutionStatus(`Transaction: ${process.txHash}`);
              }
              if (process.status) {
                setExecutionStatus(`Status: ${process.status}`);
              }
            });
          });
        },
        acceptExchangeRateUpdateHook: async (params) => {
          console.log('Exchange rate update:', params);
          // Auto-accept for demo purposes
          return true;
        },
      });

      setExecutionStatus('Route executed successfully!');
      console.log('Route executed:', executedRoute);
    } catch (err: any) {
      console.error('Error executing route:', err);
      setError(err.message || 'Failed to execute route');
      setExecutionStatus('Execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Test function: Arbitrum USDC to Optimism DAI
  const testArbitrumToOptimism = () => {
    setFromChain(SUPPORTED_CHAINS.ARBITRUM);
    setToChain(SUPPORTED_CHAINS.OPTIMISM);
    setFromToken('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'); // USDC
    setToToken('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'); // DAI
    setAmount('10');
  };

  // Test function: Base ETH to Polygon USDC
  const testBaseToPolygon = () => {
    setFromChain(SUPPORTED_CHAINS.BASE);
    setToChain(SUPPORTED_CHAINS.POLYGON);
    setFromToken('0x0000000000000000000000000000000000000000'); // ETH
    setToToken('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'); // USDC
    setAmount('0.01');
  };

  // Test function: Polygon USDC to Base USDC
  const testPolygonToBase = () => {
    setFromChain(SUPPORTED_CHAINS.POLYGON);
    setToChain(SUPPORTED_CHAINS.BASE);
    setFromToken('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'); // USDC
    setToToken('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'); // USDC
    setAmount('5');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Cross-Chain Bridge
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Powered by LI.FI - Swap and bridge tokens across multiple chains
            </p>
          </div>

          {/* Test Buttons Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Test Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={testArbitrumToOptimism}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Test: ARB USDC → OP DAI
              </button>
              <button
                onClick={testBaseToPolygon}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Test: BASE ETH → MATIC USDC
              </button>
              <button
                onClick={testPolygonToBase}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition"
              >
                Test: MATIC USDC → BASE USDC
              </button>
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
                  onChange={(e) => setFromChain(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary"
                >
                  {Object.entries(CHAIN_NAMES).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
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
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary"
                >
                  {COMMON_TOKENS[fromChain]?.map((token) => (
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
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

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
                  onChange={(e) => setToChain(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary"
                >
                  {Object.entries(CHAIN_NAMES).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
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
                  className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary"
                >
                  {COMMON_TOKENS[toChain]?.map((token) => (
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleGetQuote}
                  disabled={isLoading || !walletAddress}
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Quote'}
                </button>
                <button
                  onClick={handleGetRoutes}
                  disabled={isLoading || !walletAddress}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Routes'}
                </button>
              </div>

              {selectedRoute && (
                <button
                  onClick={handleExecuteRoute}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Executing...' : 'Execute Selected Route'}
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Execution Status */}
          {executionStatus && (
            <div className="bg-blue-500/10 border border-blue-500 text-blue-400 p-4 rounded-lg mb-6">
              <p className="font-semibold">Status:</p>
              <p>{executionStatus}</p>
              {txHash && (
                <p className="text-sm mt-2 break-all">
                  Transaction Hash: <span className="font-mono">{txHash}</span>
                </p>
              )}
            </div>
          )}

          {/* Quote Display */}
          {quote && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quote Result</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">From Amount:</span>
                  <span className="text-white font-mono">
                    {quote.action?.fromToken?.symbol} {formatUnits(BigInt(quote.action?.fromAmount || 0), quote.action?.fromToken?.decimals || 18)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">To Amount (Estimated):</span>
                  <span className="text-white font-mono">
                    {quote.action?.toToken?.symbol} {formatUnits(BigInt(quote.estimate?.toAmount || 0), quote.action?.toToken?.decimals || 18)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tool:</span>
                  <span className="text-white">{quote.toolDetails?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Time:</span>
                  <span className="text-white">{quote.estimate?.executionDuration || 0}s</span>
                </div>
              </div>
              <details className="mt-4">
                <summary className="text-slate-400 cursor-pointer hover:text-white">View Full Quote JSON</summary>
                <pre className="mt-2 bg-slate-900 p-4 rounded-lg overflow-auto text-xs text-slate-300">
                  {JSON.stringify(quote, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Routes Display */}
          {routes.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Available Routes ({routes.length})</h2>
              <div className="space-y-4">
                {routes.map((route, index) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedRoute?.id === route.id
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-semibold">Route {index + 1}</span>
                      <span className="text-green-400 font-mono">
                        {formatUnits(BigInt(route.toAmount), route.toToken.decimals)} {route.toToken.symbol}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>Steps: {route.steps.length}</p>
                      <p>Time: ~{route.steps.reduce((acc, step) => acc + (step.estimate.executionDuration || 0), 0)}s</p>
                      <p>Tools: {route.steps.map(s => s.toolDetails.name).join(' → ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
