'use client';

import { useState, useEffect } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import AddEmployeeForm from './AddEmployeeForm';
import AddInvoiceForm from './AddInvoiceForm';

export default function AdminPanel() {
  const { isConnected, isAdmin: checkAdmin, getInvoiceTally } = usePayroll();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<{
    totalInvoices: bigint;
    paidInvoices: bigint;
    totalPaid: bigint;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isConnected) {
        try {
          const adminStatus = await checkAdmin();
          setIsAdmin(adminStatus);
          
          if (adminStatus) {
            try {
              const tally = await getInvoiceTally();
              setStats(tally);
            } catch (err) {
              console.error('Error fetching stats:', err);
            }
          }
        } catch (err: any) {
          console.error('Error checking admin status:', err);
          setIsAdmin(true); 
          if (err.message?.includes('chainId') || err.message?.includes('network')) {
            setNetworkError(true);
          }
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [isConnected, checkAdmin, getInvoiceTally]);

  if (!isConnected) {
    return null;
  }

  if (loading) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="animate-pulse text-blue-200/60">Checking admin status...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      {networkError && (
        <div className="glass-panel p-4 border-l-4 border-yellow-500 bg-yellow-500/10">
          <div className="flex items-center gap-3 text-yellow-200">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Network Issue Detected</p>
              <p className="text-sm opacity-80">
                Please ensure you're connected to Scroll Sepolia network. Some features may not work properly.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="glass-panel p-6 sm:p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 relative z-10">Admin Panel</h2>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/5">
              <div className="text-blue-200/60 text-xs sm:text-sm uppercase tracking-wider mb-1">Total Invoices</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {stats.totalInvoices.toString()}
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/5">
              <div className="text-blue-200/60 text-xs sm:text-sm uppercase tracking-wider mb-1">Paid Invoices</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {stats.paidInvoices.toString()}
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/5">
              <div className="text-blue-200/60 text-xs sm:text-sm uppercase tracking-wider mb-1">Total Paid</div>
              <div className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ${(Number(stats.totalPaid) / 1e18).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <AddEmployeeForm />
        <AddInvoiceForm />
      </div>
    </div>
  );
}
