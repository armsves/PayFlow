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
      const employeesResponse = await fetch('/api/arkiv/employees');
      const employees = await employeesResponse.json();
      const employeeNumber = employees.length;

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
      
      await addEmployee(walletAddress, employee.id);
      
      setSuccess(true);
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
      <div className="glass-panel p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-3xl">🔒</div>
        <p className="text-blue-200/60">Connect your wallet to add employees</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          👤
        </div>
        <h3 className="text-xl font-semibold text-white">Add New Employee</h3>
      </div>
      
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Wallet Address
        </label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          required
          className="glass-input w-full px-4 py-3 text-white placeholder-white/20"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          className="glass-input w-full px-4 py-3 text-white placeholder-white/20"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          className="glass-input w-full px-4 py-3 text-white placeholder-white/20"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-blue-200/60 mb-2 ml-1">
          Role
        </label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Developer"
          required
          className="glass-input w-full px-4 py-3 text-white placeholder-white/20"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm backdrop-blur-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-300 text-sm backdrop-blur-md">
          Employee added successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="glass-button w-full py-4 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? 'Adding Employee...' : 'Add Employee'}
      </button>
    </form>
  );
}
