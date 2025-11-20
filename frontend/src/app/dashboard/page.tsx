'use client';

import { useState, useEffect } from 'react';
import EmployeeList from '@/components/EmployeeList';
import InvoiceList from '@/components/InvoiceList';
import { Employee, Invoice } from '@/types';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  useEffect(() => {
    loadEmployees();
    loadAllInvoices();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/arkiv/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadAllInvoices = async () => {
    try {
      const response = await fetch('/api/arkiv/invoices/all');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  return (
    <main className="min-h-screen pb-12 sm:pb-20">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-8 sm:mb-12 text-center relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-[60px] sm:blur-[80px] rounded-full transform -translate-y-1/2 pointer-events-none"></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight relative z-10">Dashboard</h1>
          <p className="text-blue-200/60 text-sm sm:text-base md:text-lg relative z-10 px-4">Overview of your organization's activity</p>
        </header>

        <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
          <EmployeeList employees={employees} loading={loadingEmployees} onRefresh={loadEmployees} />
          <InvoiceList invoices={invoices} loading={loadingInvoices} onRefresh={loadAllInvoices} />
        </div>
      </div>
    </main>
  );
}
