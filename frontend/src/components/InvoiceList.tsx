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
      <div className="bg-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400">Loading invoices...</p>
      </div>
    );
  }

  const filteredInvoices = selectedEmployee === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.employeeAddress?.toLowerCase() === selectedEmployee.toLowerCase());

  const uniqueEmployees = Array.from(new Set(invoices.map(inv => inv.employeeAddress).filter(Boolean)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-white">Invoices</h2>
          <select 
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-primary"
          >
            <option value="all">All Employees</option>
            {uniqueEmployees.map(addr => (
              <option key={addr} value={addr}>
                {addr.slice(0, 6)}...{addr.slice(-4)}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={onRefresh}
          className="text-primary hover:text-accent transition"
        >
          Refresh
        </button>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-8 text-center">
          <p className="text-slate-400">No invoices found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className={`bg-slate-800 rounded-xl p-6 border transition ${
                invoice.paid 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-slate-700 hover:border-primary'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Invoice #{invoice.invoiceNumber}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.paid 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {invoice.paid ? '✓ PAID' : '⏳ UNPAID'}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 mb-3">{invoice.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Employee:</span>
                      <p className="text-slate-300 font-mono">
                        #{invoice.employeeNumber} • {invoice.employeeAddress ? `${invoice.employeeAddress.slice(0, 8)}...${invoice.employeeAddress.slice(-6)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Amount:</span>
                      <p className="text-primary font-semibold text-lg">
                        ${(parseFloat(invoice.amount) / 1000000).toFixed(2)} USDC
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Chain:</span>
                      <p className="text-slate-300">
                        {invoice.chainId === 534351 ? 'Scroll Sepolia' : `Chain ${invoice.chainId}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Created:</span>
                      <p className="text-slate-300">
                        {new Date(invoice.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {!invoice.paid && (
                  <button
                    onClick={() => alert(`Payment flow for invoice #${invoice.invoiceNumber}`)}
                    className="ml-6 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
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
