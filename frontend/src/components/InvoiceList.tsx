'use client';

import { Invoice } from '@/types';
import { useState } from 'react';

interface InvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  onRefresh: () => void;
}

export default function InvoiceList({ invoices, loading, onRefresh }: InvoiceListProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-purple-200/60">Loading invoices...</p>
      </div>
    );
  }

  const filteredInvoices = selectedEmployee === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.employeeAddress?.toLowerCase() === selectedEmployee.toLowerCase());

  const uniqueEmployees = Array.from(new Set(invoices.map(inv => inv.employeeAddress).filter(Boolean)));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 px-2 gap-4">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <h2 className="text-2xl font-bold text-white tracking-tight">Invoices</h2>
          <div className="relative">
            <select 
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="appearance-none bg-white/5 text-white pl-4 pr-10 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-white/30 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="all" className="bg-slate-900">All Employees</option>
              {uniqueEmployees.map(addr => (
                <option key={addr} value={addr} className="bg-slate-900">
                  {addr.slice(0, 6)}...{addr.slice(-4)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">▼</div>
          </div>
        </div>
        <button 
          onClick={onRefresh}
          className="text-purple-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 self-end sm:self-auto"
        >
          <span>↻</span> Refresh
        </button>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="glass-panel p-12 text-center">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📄</div>
          <p className="text-blue-200/60 text-lg">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className={`glass-panel p-6 transition-all duration-300 group ${
                invoice.paid 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between md:justify-start gap-4 mb-3">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      #{invoice.invoiceNumber}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${
                      invoice.paid 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {invoice.paid ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  
                  <p className="text-white/80 mb-4 text-lg font-light">{invoice.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm border-t border-white/5 pt-4 mt-2">
                    <div>
                      <span className="text-blue-200/40 uppercase tracking-wider text-xs font-semibold block mb-1">Employee</span>
                      <p className="text-blue-200/80 font-mono text-xs">
                        {invoice.employeeAddress ? `${invoice.employeeAddress.slice(0, 6)}...${invoice.employeeAddress.slice(-4)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-200/40 uppercase tracking-wider text-xs font-semibold block mb-1">Amount</span>
                      <p className="text-white font-bold text-base">
                        ${(parseFloat(invoice.amount) / 1000000).toFixed(2)} <span className="text-xs text-white/50 font-normal">USDC</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-200/40 uppercase tracking-wider text-xs font-semibold block mb-1">Network</span>
                      <p className="text-blue-200/80">
                        {invoice.chainId === 534351 ? 'Scroll Sepolia' : `Chain ${invoice.chainId}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-200/40 uppercase tracking-wider text-xs font-semibold block mb-1">Date</span>
                      <p className="text-blue-200/80">
                        {new Date(invoice.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {!invoice.paid && (
                  <button
                    onClick={() => alert(`Payment flow for invoice #${invoice.invoiceNumber}`)}
                    className="w-full md:w-auto glass-button px-8 py-4 rounded-xl font-semibold text-sm whitespace-nowrap shadow-lg bg-gradient-to-r from-blue-600/80 to-blue-500/80 hover:from-blue-500 hover:to-blue-400 border-none"
                  >
                    Process Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
