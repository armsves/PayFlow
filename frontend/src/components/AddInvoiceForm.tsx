'use client';

import { useState, useEffect } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import { Employee } from '@/types';

export default function AddInvoiceForm() {
  const { createInvoice, loading, error, isConnected } = usePayroll();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    loadEmployees();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!selectedEmployee) {
      return;
    }

    const employee = employees.find(emp => emp.walletAddress === selectedEmployee);
    if (!employee) {
      return;
    }

    try {
      const amountInWei = (parseFloat(amount) * 1_000_000).toString();
      const USDC_ADDRESS = '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'; // Scroll Sepolia USDC

      const invoicesResponse = await fetch('/api/arkiv/invoices/all');
      const invoices = await invoicesResponse.json();
      const invoiceNumber = invoices.length;

      const response = await fetch('/api/arkiv/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          employeeAddress: employee.walletAddress,
          employeeNumber: employee.employeeNumber,
          amount: amountInWei,
          token: USDC_ADDRESS,
          description,
          paid: false,
          chainId: 534351, // Scroll Sepolia
          timestamp: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add invoice to Arkiv');
      }

      const invoice = await response.json();
      
      try {
        await createInvoice(
          employee.walletAddress,
          amountInWei,
          USDC_ADDRESS,
          invoice.id,
          534351
        );
      } catch (contractError) {
        console.warn('Failed to add invoice to blockchain, but saved to Arkiv:', contractError);
      }
      
      setSuccess(true);
      setSelectedEmployee('');
      setAmount('');
      setDescription('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error adding invoice:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-3xl">🔒</div>
        <p className="text-blue-200/60">Connect your wallet to create invoices</p>
      </div>
    );
  }

  if (loadingEmployees) {
    return (
      <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-blue-200/60">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-blue-200/60">No employees found. Add an employee first.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
          📄
        </div>
        <h3 className="text-xl font-semibold text-white">Create New Invoice</h3>
      </div>
      
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Select Employee
        </label>
        <div className="relative">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="glass-input w-full px-4 py-3 text-white appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-400">-- Select an employee --</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.walletAddress} className="bg-slate-900">
                {employee.name} - {employee.role}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">▼</div>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Amount (USDC)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000.00"
            required
            min="0"
            step="0.01"
            className="glass-input w-full pl-8 pr-4 py-3 text-white placeholder-white/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="November 2025 Salary"
          required
          rows={3}
          className="glass-input w-full px-4 py-3 text-white placeholder-white/20 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm backdrop-blur-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-300 text-sm backdrop-blur-md">
          Invoice created successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedEmployee}
        className="glass-button w-full py-4 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? 'Creating Invoice...' : 'Create Invoice'}
      </button>
    </form>
  );
}
