'use client';

import { useState, useEffect } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import AddEmployeeForm from './AddEmployeeForm';

export default function AdminPanel() {
  const { isConnected, isAdmin: checkAdmin, getInvoiceTally } = usePayroll();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<{
    totalInvoices: bigint;
    paidInvoices: bigint;
    totalPaid: bigint;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isConnected) {
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
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">Checking admin status...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Panel</h2>
        
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/80 text-sm">Total Invoices</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats.totalInvoices.toString()}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/80 text-sm">Paid Invoices</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats.paidInvoices.toString()}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/80 text-sm">Total Paid</div>
              <div className="text-2xl font-bold text-white mt-1">
                ${(Number(stats.totalPaid) / 1e18).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      <AddEmployeeForm />
    </div>
  );
}
