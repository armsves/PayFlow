'use client';

import AdminPanel from '@/components/AdminPanel';

export default function ManagePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Manage Payroll</h1>
          <p className="text-slate-400">Add employees and create invoices</p>
        </header>

        <AdminPanel />
      </div>
    </main>
  );
}
