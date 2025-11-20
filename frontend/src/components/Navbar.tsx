'use client';

import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">₿</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PayFlow
              </h1>
              <p className="text-xs text-slate-500">Cross-Chain Payroll</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/manage"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              Manage
            </Link>
            <Link
              href="/bridge"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              Bridge
            </Link>
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}
