'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="mb-8">
            <div className="inline-block w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6">
              <span className="text-white font-bold text-4xl">₿</span>
            </div>
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PayFlow
              </span>
            </h1>
            <p className="text-2xl text-slate-300 mb-8">
              Cross-Chain Payroll Platform
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Streamline your global workforce payments with decentralized technology. 
              Manage employees, create invoices, and execute cross-chain payments seamlessly.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary/50 transition transform hover:scale-105"
            >
              View Dashboard
            </Link>
            <Link
              href="/manage"
              className="bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-slate-700 hover:border-primary transition"
            >
              Manage Payroll
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-primary transition">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Employee Management</h3>
            <p className="text-slate-400">
              Add and manage employee records on-chain with decentralized storage via Arkiv Network.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-primary transition">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Invoice Creation</h3>
            <p className="text-slate-400">
              Generate and track invoices with smart contract integration and permanent storage.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 hover:border-primary transition">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Cross-Chain Payments</h3>
            <p className="text-slate-400">
              Execute payments across multiple blockchain networks with automated routing.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Scroll', 'Arkiv', 'Privy', 'Wormhole', 'Crossmint', 'LiFi'].map((tech) => (
              <div
                key={tech}
                className="bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-slate-700 text-slate-300 font-medium"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
