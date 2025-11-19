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
      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = (parseFloat(amount) * 1_000_000).toString();
      const USDC_ADDRESS = '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'; // Scroll Sepolia USDC

      // Get the next invoice number
      const invoicesResponse = await fetch('/api/arkiv/invoices/all');
      const invoices = await invoicesResponse.json();
      const invoiceNumber = invoices.length;

      // First, add invoice to Arkiv via API
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
      
      // Then add to blockchain (optional, if network is available)
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
      // Reset form
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
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">Connect your wallet to create invoices</p>
      </div>
    );
  }

  if (loadingEmployees) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">No employees found. Add an employee first.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Create New Invoice</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Select Employee
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select an employee --</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.walletAddress}>
              {employee.name} - {employee.role} ({employee.walletAddress.slice(0, 6)}...{employee.walletAddress.slice(-4)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Amount (USDC)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5000.00"
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-400 mt-1">Enter amount in USDC</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="November 2025 Salary"
          required
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
          Invoice created successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedEmployee}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Creating Invoice...' : 'Create Invoice'}
      </button>
    </form>
  );
}
