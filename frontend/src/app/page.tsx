'use client';

import { useState, useEffect } from 'react';
import EmployeeList from '@/components/EmployeeList';
import InvoiceList from '@/components/InvoiceList';
import ConnectWallet from '@/components/ConnectWallet';
import AdminPanel from '@/components/AdminPanel';
import { Employee, Invoice } from '@/types';

export default function Home() {
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
      // Call the serverless API instead of exposing private key
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
      // Fetch all invoices by querying without employeeAddress filter
      // We'll need to create a route that gets all invoices
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PayFlow
            </h1>
            <p className="text-slate-400 mt-2">Cross-Chain Payroll Platform</p>
          </div>
          <ConnectWallet />
        </header>

        <div className="space-y-8">
          <AdminPanel />
          <EmployeeList employees={employees} loading={loadingEmployees} onRefresh={loadEmployees} />
          <InvoiceList invoices={invoices} loading={loadingInvoices} onRefresh={loadAllInvoices} />
        </div>
      </div>
    </main>
  );
}
