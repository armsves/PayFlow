'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] opacity-30 pointer-events-none" style={{ background: 'var(--primary-glow)' }}></div>

      <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-24">
          <div className="mb-8 sm:mb-12 relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-[60px] sm:blur-[100px] rounded-full"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 mb-6 sm:mb-8 glass-panel rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <span className="text-white font-bold text-3xl sm:text-5xl drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">₿</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
              <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent drop-shadow-sm">
                PayFlow
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100/80 mb-6 sm:mb-8 font-light tracking-wide">
              Cross-Chain Payroll Platform
            </p>
            <p className="text-sm sm:text-base md:text-lg text-blue-200/60 max-w-2xl mx-auto leading-relaxed px-4">
              Streamline your global workforce payments with decentralized technology.
              Manage employees, create invoices, and execute cross-chain payments seamlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link
              href="/dashboard"
              className="glass-button px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(14,165,233,0.2)] hover:shadow-[0_0_50px_rgba(14,165,233,0.4)] backdrop-blur-xl"
            >
              View Dashboard
            </Link>
            <Link
              href="/manage"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg text-white/70 hover:text-white border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
            >
              Manage Payroll
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {[
            { icon: '👥', title: 'Employee Management', desc: 'Add and manage employee records on-chain with decentralized storage via Arkiv Network.' },
            { icon: '📄', title: 'Invoice Creation', desc: 'Generate and track invoices with smart contract integration and permanent storage.' },
            { icon: '🌐', title: 'Cross-Chain Payments', desc: 'Execute payments across multiple blockchain networks with automated routing.' }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-6 sm:p-8 hover:bg-white/5 transition-all duration-500 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-inner">
                <span className="text-2xl sm:text-3xl filter drop-shadow-lg">{feature.icon}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-blue-100/50 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs sm:text-sm uppercase tracking-widest text-blue-200/40 font-bold mb-6 sm:mb-10">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {['Scroll', 'Arkiv', 'Privy', 'Wormhole', 'Crossmint', 'LiFi'].map((tech) => (
              <div
                key={tech}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/5 bg-white/5 text-sm sm:text-base text-blue-100/60 font-medium hover:bg-white/10 hover:border-white/10 hover:text-white transition-all duration-300 cursor-default backdrop-blur-md"
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
