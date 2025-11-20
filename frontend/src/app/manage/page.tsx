'use client';

import AdminPanel from '@/components/AdminPanel';

export default function ManagePage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center relative">
           <div className="absolute inset-0 bg-purple-500/10 blur-[80px] rounded-full transform -translate-y-1/2 pointer-events-none"></div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight relative z-10">Manage Payroll</h1>
          <p className="text-blue-200/60 text-lg relative z-10">Add employees and create invoices</p>
        </header>

        <div className="max-w-5xl mx-auto">
          <AdminPanel />
        </div>
      </div>
    </main>
  );
}
