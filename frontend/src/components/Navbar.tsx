'use client';

import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-50 px-4 mb-8">
      <div className="glass-panel mx-auto max-w-7xl">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300">
                <span className="text-white font-bold text-xl">₿</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">
                  PayFlow
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-200/70 font-semibold">Cross-Chain Payroll</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/5 rounded-full p-1 mr-4 border border-white/10">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/manage">Manage</NavLink>
                <NavLink href="/bridge">LiFi Bridge</NavLink>
                <NavLink href="/wormhole">Wormhole</NavLink>
              </div>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-5 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 relative overflow-hidden group"
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
