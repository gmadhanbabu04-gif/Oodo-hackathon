import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function PaymentsView({ currentUser }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPayments().then(res => {
      setPayments(res || []);
      setLoading(false);
    });
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Payments & Reconciliation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of all settled payments matched against customer invoices
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Total Collected: ${totalCollected.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading payment ledger...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference Note</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {pay.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#714B67]">
                      {pay.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {pay.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {pay.paymentMethod?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {pay.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {pay.referenceNote}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                      ${Number(pay.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
