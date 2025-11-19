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
          <div className="text-sm">
            <div className="text-slate-400">Connected</div>
            <div className="font-mono text-white">{formatAddress(address)}</div>
          </div>
          <button
            onClick={() => logout()}
            className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => login()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
