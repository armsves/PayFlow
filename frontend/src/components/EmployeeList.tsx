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
      <div className="glass-panel p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-blue-200/60">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">👥</div>
        <p className="text-blue-200/60 mb-6 text-lg">No employees yet</p>
        <button className="glass-button px-8 py-3 rounded-full font-medium">
          Add First Employee
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Employees</h2>
        <button 
          onClick={onRefresh}
          className="text-blue-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>↻</span> Refresh
        </button>
      </div>

      <div className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="glass-panel p-6 transition-all duration-300 hover:bg-white/5 group"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold text-white border border-white/10 shadow-inner">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {employee.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                        employee.active ? 'bg-green-500/20 text-green-300 border border-green-500/20' : 'bg-red-500/20 text-red-300 border border-red-500/20'
                      }`}>
                        {employee.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-blue-200/60 text-sm">{employee.role} • {employee.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm ml-16 mt-1">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-blue-200/50 font-mono text-xs">
                    {employee.walletAddress.slice(0, 6)}...{employee.walletAddress.slice(-4)}
                  </span>
                  <span className="flex items-center gap-2 text-blue-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Total Paid: <span className="text-white font-semibold">${(employee.totalPaid / 1000000).toFixed(2)}</span>
                  </span>
                  <span className="flex items-center gap-2 text-blue-200/70">
                     <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    {employee.invoiceCount} invoice{employee.invoiceCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePayEmployee(employee)}
                className="glass-button px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap shadow-lg"
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
