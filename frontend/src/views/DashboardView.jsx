import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Repeat, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function DashboardView({ onOpenBillingModal, onSelectInvoice }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    async function loadData() {
      const start = performance.now();
      try {
        const res = await api.getAnalyticsSummary();
        setData(res);
      } catch (err) {
        console.error('Error fetching analytics', err);
      } finally {
        const duration = Math.round(performance.now() - start);
        setLatency(duration);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-semibold">
        <Activity className="w-5 h-5 animate-spin mr-2 text-[#714B67]" />
        Aggregating subscription metrics & recurring billing ledger...
      </div>
    );
  }

  const kpis = [
    {
      title: 'Active Subscriptions',
      value: data?.activeSubscriptionsCount || 0,
      sub: `${data?.quotationsCount || 0} quotes pending`,
      icon: Repeat,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      title: 'Monthly Recurring (MRR)',
      value: `$${(data?.mrr || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `ARR: $${(data?.arr || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'text-[#714B67]',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      title: 'Collected Revenue',
      value: `$${(data?.totalCollected || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `Billed: $${(data?.totalBilled || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Outstanding & Overdue',
      value: `$${(data?.totalOverdue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `${data?.overdueInvoicesCount || 0} overdue invoices`,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Performance Metric (<2s Guarantee) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Finance Lead Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time subscription volume, recurring cashflow, and collection intelligence
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Latency Speed Tag */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
            <Zap className="w-3.5 h-3.5 fill-current text-emerald-500" />
            <span>Response: {latency}ms (Requirement &lt;2s)</span>
          </div>

          <button
            onClick={onOpenBillingModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>Run Billing Engine</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white border ${kpi.border} shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`mt-3 text-2xl font-black tracking-tight ${kpi.color}`}>
                {kpi.value}
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue Chase Alert Banner */}
      {data?.overdueInvoicesCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Attention Required: {data.overdueInvoicesCount} Overdue Invoices (${data.totalOverdue.toFixed(2)})
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Outstanding payments past due date. Follow up with customers before they turn into lost revenue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Status Breakdown & Recent Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Subscription Lifecycle Pipeline
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Contracts</span>
              </span>
              <span className="font-bold text-slate-900">{data?.activeSubscriptionsCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Quotations in Review</span>
              </span>
              <span className="font-bold text-slate-900">{data?.quotationsCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Paused Subscriptions</span>
              </span>
              <span className="font-bold text-slate-900">{data?.pausedSubscriptionsCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Closed / Expired</span>
              </span>
              <span className="font-bold text-slate-900">{data?.closedSubscriptionsCount || 0}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800">Total Managed Subscriptions</span>
              <span className="text-[#714B67]">{data?.totalSubscriptions || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recent Invoices & Status
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Invoice #</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Due Date</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentInvoices || []).map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice && onSelectInvoice(inv)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-mono font-bold text-[#714B67]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-800">
                      {inv.customerName}
                    </td>
                    <td className="py-2.5 text-slate-500 font-medium">
                      {inv.dueDate}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                      ${Number(inv.balanceDue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
