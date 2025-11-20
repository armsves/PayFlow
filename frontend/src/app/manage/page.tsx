'use client';

import AdminPanel from '@/components/AdminPanel';

export default function ManagePage() {
  return (
    <main className="min-h-screen pb-12 sm:pb-20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-8 sm:mb-12 text-center relative">
           <div className="absolute inset-0 bg-purple-500/10 blur-[60px] sm:blur-[80px] rounded-full transform -translate-y-1/2 pointer-events-none"></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight relative z-10">Manage Payroll</h1>
          <p className="text-blue-200/60 text-sm sm:text-base md:text-lg relative z-10 px-4">Add employees and create invoices</p>
        </header>

        <div className="max-w-5xl mx-auto">
          <AdminPanel />
        </div>
      </div>
    </main>
  );
}
