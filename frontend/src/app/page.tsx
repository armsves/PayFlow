'use client';

import { useState, useEffect } from 'react';
import EmployeeList from '@/components/EmployeeList';
import { ArkivService } from '@/lib/arkiv';

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const arkiv = new ArkivService(process.env.NEXT_PUBLIC_ARKIV_API_KEY || '');
      const data = await arkiv.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PayFlow
          </h1>
          <p className="text-slate-400 mt-2">Cross-Chain Payroll Platform</p>
        </header>

        <EmployeeList employees={employees} loading={loading} onRefresh={loadEmployees} />
      </div>
    </main>
  );
}
