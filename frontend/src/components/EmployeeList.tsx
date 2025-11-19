'use client';

import { Employee } from '@/types';

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onRefresh: () => void;
}

export default function EmployeeList({ employees, loading, onRefresh }: EmployeeListProps) {
  const handlePayEmployee = async (employee: Employee) => {
    alert(`Initiating payment to ${employee.name}`);
    // Payment logic here
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400 mb-4">No employees yet</p>
        <button className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
          Add First Employee
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Employees</h2>
        <button 
          onClick={onRefresh}
          className="text-primary hover:text-accent transition"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-primary transition"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {employee.name}
                </h3>
                <p className="text-slate-400 text-sm mb-2">{employee.email}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-500">
                    {employee.walletAddress.slice(0, 6)}...{employee.walletAddress.slice(-4)}
                  </span>
                  <span className="text-primary font-semibold">
                    ${employee.salary.toLocaleString()}
                  </span>
                  <span className="text-slate-500">{employee.chainPreference}</span>
                </div>
              </div>

              <button
                onClick={() => handlePayEmployee(employee)}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
