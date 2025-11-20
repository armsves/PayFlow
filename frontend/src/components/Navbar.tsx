'use client';

import { useState } from 'react';
import Link from 'next/link';
import ConnectWallet from './ConnectWallet';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-4 z-50 px-4 mb-8">
      <div className="glass-panel mx-auto max-w-7xl">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-300">
                <span className="text-white font-bold text-lg sm:text-xl">₿</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">
                  PayFlow
                </h1>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-blue-200/70 font-semibold">Cross-Chain Payroll</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center bg-white/5 rounded-full p-1 mr-4 border border-white/10">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/manage">Manage</NavLink>
                <NavLink href="/bridge">Bridge</NavLink>
                <NavLink href="/wormhole">Wormhole</NavLink>
              </div>
              <ConnectWallet />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <ConnectWallet />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                <MobileNavLink href="/manage" onClick={() => setMobileMenuOpen(false)}>Manage</MobileNavLink>
                <MobileNavLink href="/bridge" onClick={() => setMobileMenuOpen(false)}>Bridge</MobileNavLink>
                <MobileNavLink href="/wormhole" onClick={() => setMobileMenuOpen(false)}>Wormhole</MobileNavLink>
              </div>
            </div>
          )}
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

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300 block"
    >
      {children}
    </Link>
  );
}
