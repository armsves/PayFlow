'use client';

import { useState } from 'react';
import { usePayroll } from '@/hooks/usePayroll';

export default function AddEmployeeForm() {
  const { addEmployee, loading, error, isConnected } = usePayroll();
  const [walletAddress, setWalletAddress] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      // Get the next employee number (count current employees)
      const employeesResponse = await fetch('/api/arkiv/employees');
      const employees = await employeesResponse.json();
      const employeeNumber = employees.length;

      // First, add employee to Arkiv via API
      const response = await fetch('/api/arkiv/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeNumber,
          walletAddress,
          name,
          email,
          role,
          active: true,
          totalPaid: 0,
          invoiceCount: 0,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add employee to Arkiv');
      }

      const employee = await response.json();
      
      // Then add to blockchain
      await addEmployee(walletAddress, employee.id);
      
      setSuccess(true);
      // Reset form
      setWalletAddress('');
      setName('');
      setEmail('');
      setRole('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error adding employee:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">Connect your wallet to add employees</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Add New Employee</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Wallet Address
        </label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Role
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Developer"
          required
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
          Employee added successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Adding Employee...' : 'Add Employee'}
      </button>
    </form>
  );
}
