'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import {
  getRoutes,
  getQuote,
  executeRoute,
  type Route,
  type QuoteRequest,
  type RoutesRequest,
} from '@lifi/sdk';
import { initializeLiFi, configureLiFiProviders, SUPPORTED_CHAINS, CHAIN_NAMES } from '@/lib/lifi-config';
import { formatUnits, parseUnits, type Address } from 'viem';

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
    console.log('Wallets:', wallets);
    if (wallets && wallets.length > 0) {
      // Try to find any connected wallet
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0];
      console.log('Selected wallet:', embeddedWallet);
      if (embeddedWallet?.address) {
        setWalletAddress(embeddedWallet.address);
        console.log('Wallet address set:', embeddedWallet.address);
      }
    } else {
      console.log('No wallets found');
      setWalletAddress('');
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

    if (!wallets || wallets.length === 0) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError('');
    setExecutionStatus('Configuring provider...');
    setTxHash('');

    try {
      // Get the connected wallet
      const wallet = wallets.find(w => w.walletClientType === 'privy') || wallets[0];

      // Get the Ethereum provider from the wallet
      const provider = await wallet.getEthereumProvider();

      if (!provider) {
        throw new Error('Failed to get Ethereum provider from wallet');
      }

      // Configure LI.FI providers with the connected wallet
      await configureLiFiProviders(
        wallet.address as Address,
        provider,
        fromChain
      );

      console.log('LI.FI providers configured successfully');
      setExecutionStatus('Executing route...');

      const executedRoute = await executeRoute(selectedRoute, {
        updateRouteHook: (updatedRoute: Route) => {
          console.log('Route update:', updatedRoute);

          // Extract transaction hash if available
          updatedRoute.steps.forEach((step: any) => {
            step.execution?.process.forEach((process: any) => {
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
        acceptExchangeRateUpdateHook: async (params: any) => {
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
    <main className="min-h-screen pb-20 relative">
       {/* Decorative Glows */}
      <div className="absolute top-40 left-0 w-[500px] h-[500px] opacity-20 pointer-events-none blur-[120px] bg-blue-600/40"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none blur-[120px] bg-purple-600/40"></div>

      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight text-white">
              Cross-Chain Bridge
            </h1>
            <p className="text-blue-200/60 text-sm sm:text-base md:text-lg max-w-lg mx-auto px-4">
              Powered by LI.FI - Swap and bridge tokens across multiple chains
            </p>
          </div>

          {/* Test Buttons Section */}
          <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-lg sm:text-xl">🧪</span> Quick Test Scenarios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={testArbitrumToOptimism}
                className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
              >
                ARB USDC → OP DAI
              </button>
              <button
                onClick={testBaseToPolygon}
                className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
              >
                BASE ETH → MATIC USDC
              </button>
              <button
                onClick={testPolygonToBase}
                className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
              >
                MATIC USDC → BASE USDC
              </button>
            </div>
          </div>

          {/* Bridge Form */}
          <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 space-y-6 sm:space-y-8">
              {/* From Section */}
              <div className="bg-black/20 rounded-2xl p-4 sm:p-6 border border-white/5">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <span className="text-xs uppercase tracking-widest text-blue-200/50 font-bold">From</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Chain
                    </label>
                    <select
                      value={fromChain}
                      onChange={(e) => setFromChain(Number(e.target.value))}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                    >
                      {Object.entries(CHAIN_NAMES).map(([id, name]) => (
                        <option key={id} value={id} className="bg-slate-900">{name}</option>
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
                      {COMMON_TOKENS[fromChain]?.map((token) => (
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
                      className="glass-input w-full pl-3 sm:pl-4 pr-12 sm:pr-16 py-3 sm:py-4 text-xl sm:text-2xl font-light text-white placeholder-white/10 bg-transparent border-none focus:ring-0 focus:bg-white/5 transition-colors"
                    />
                  </div>
                </div>
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
                   <span className="text-xs uppercase tracking-widest text-blue-200/50 font-bold">To</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-blue-200/60 mb-2">
                      Chain
                    </label>
                    <select
                      value={toChain}
                      onChange={(e) => setToChain(Number(e.target.value))}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white cursor-pointer"
                    >
                      {Object.entries(CHAIN_NAMES).map(([id, name]) => (
                        <option key={id} value={id} className="bg-slate-900">{name}</option>
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
                      {COMMON_TOKENS[toChain]?.map((token) => (
                        <option key={token.address} value={token.address} className="bg-slate-900">
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Wallet Address Display */}
              <div className={`p-3 sm:p-4 rounded-xl border flex items-center gap-3 ${
                walletAddress
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  walletAddress ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <p className="text-xs sm:text-sm text-blue-200/60 break-all">
                  {walletAddress ? (
                    <>Connected: <span className="text-white font-mono ml-1 sm:ml-2">{walletAddress}</span></>
                  ) : (
                    <>Not connected - Please click "Connect Wallet" in the navbar</>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={handleGetQuote}
                  disabled={isLoading || !walletAddress}
                  className="glass-button py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white shadow-lg bg-gradient-to-r from-blue-600/80 to-blue-500/80 hover:from-blue-500 hover:to-blue-400 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Quote'}
                </button>
                <button
                  onClick={handleGetRoutes}
                  disabled={isLoading || !walletAddress}
                  className="glass-button py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white shadow-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Get Routes'}
                </button>
              </div>

              {selectedRoute && (
                <button
                  onClick={handleExecuteRoute}
                  disabled={isLoading}
                  className="glass-button w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white shadow-lg bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 border-none disabled:opacity-50 disabled:cursor-not-allowed mt-3 sm:mt-4"
                >
                  {isLoading ? 'Executing...' : 'Execute Selected Route'}
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="glass-panel p-4 sm:p-6 border-l-4 border-red-500 bg-red-500/10 mb-4 sm:mb-6">
              <p className="font-semibold text-red-200 text-sm sm:text-base">Error</p>
              <p className="text-red-200/70 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Execution Status */}
          {executionStatus && (
            <div className="glass-panel p-4 sm:p-6 border-l-4 border-blue-500 bg-blue-500/10 mb-4 sm:mb-6">
              <p className="font-semibold text-blue-200 text-sm sm:text-base">Status</p>
              <p className="text-blue-200/70 text-xs sm:text-sm mt-1">{executionStatus}</p>
              {txHash && (
                <p className="text-xs mt-2 break-all text-blue-200/50">
                  Transaction Hash: <span className="font-mono text-white">{txHash}</span>
                </p>
              )}
            </div>
          )}

          {/* Quote Display */}
          {quote && (
            <div className="glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Quote Result</h2>
              <div className="space-y-3 sm:space-y-4 bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-blue-200/60 text-xs sm:text-sm">From Amount</span>
                  <span className="text-white font-mono text-sm sm:text-base md:text-lg font-medium break-all text-right">
                    {quote.action?.fromToken?.symbol} {formatUnits(BigInt(quote.action?.fromAmount || 0), quote.action?.fromToken?.decimals || 18)}
                  </span>
                </div>
                <div className="w-full h-px bg-white/5"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-blue-200/60 text-xs sm:text-sm">To Amount (Est.)</span>
                  <span className="text-green-400 font-mono text-sm sm:text-base md:text-lg font-medium break-all text-right">
                    {quote.action?.toToken?.symbol} {formatUnits(BigInt(quote.estimate?.toAmount || 0), quote.action?.toToken?.decimals || 18)}
                  </span>
                </div>
                <div className="w-full h-px bg-white/5"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-blue-200/60 text-xs sm:text-sm">Tool</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white">{quote.toolDetails?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-blue-200/60 text-xs sm:text-sm">Est. Time</span>
                  <span className="text-white text-xs sm:text-sm">{quote.estimate?.executionDuration || 0}s</span>
                </div>
              </div>
              <details className="mt-4 group">
                <summary className="text-blue-200/40 cursor-pointer hover:text-white text-xs uppercase tracking-widest transition-colors list-none flex items-center gap-2">
                   <span className="group-open:rotate-90 transition-transform">▶</span> View JSON
                </summary>
                <pre className="mt-4 bg-black/40 p-3 sm:p-4 rounded-xl overflow-auto text-[9px] sm:text-[10px] text-blue-200/60 font-mono border border-white/5 max-h-96">
                  {JSON.stringify(quote, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Routes Display */}
          {routes.length > 0 && (
            <div className="glass-panel p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Available Routes ({routes.length})</h2>
              <div className="space-y-3 sm:space-y-4">
                {routes.map((route, index) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                      selectedRoute?.id === route.id
                        ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                        : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mb-3">
                      <span className="text-white font-bold text-base sm:text-lg">Route {index + 1}</span>
                      <span className="text-green-400 font-mono font-bold text-base sm:text-lg break-all">
                        {formatUnits(BigInt(route.toAmount), route.toToken.decimals)} {route.toToken.symbol}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-blue-200/60 space-y-1.5">
                      <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                         Steps: {route.steps.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
                        Time: ~{route.steps.reduce((acc, step) => acc + (step.estimate.executionDuration || 0), 0)}s
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></span>
                        <span className="flex-1">Tools: <span className="text-white break-words">{route.steps.map(s => s.toolDetails.name).join(' → ')}</span></span>
                      </div>
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
