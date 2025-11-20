'use client';

import { usePrivy, useWallets, useLogin, useLogout } from '@privy-io/react-auth';

export default function ConnectWallet() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { login } = useLogin();
  const { logout } = useLogout();

  const address = user?.wallet?.address || wallets?.[0]?.address || '';

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {authenticated && address ? (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-widest text-blue-200/50 font-bold">Connected</div>
            <div className="font-mono text-sm text-white/90 shadow-blue-500/20 drop-shadow-sm">{formatAddress(address)}</div>
          </div>
          <button
            onClick={() => logout()}
            className="glass-button px-4 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => login()}
          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-full font-medium shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:scale-105 transition-all duration-300 border border-white/20"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
