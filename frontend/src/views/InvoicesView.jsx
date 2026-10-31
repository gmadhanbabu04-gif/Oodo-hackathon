import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  Send, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Zap,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function InvoicesView({ 
  onSelectInvoice, 
  onOpenBillingModal, 
  onOpenPayment, 
  currentUser 
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isCustomer = currentUser?.role === 'customer';

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await api.getInvoices({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, searchQuery]);

  // Aggregate stats
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

  const filterTabs = [
    { id: 'all', label: 'All Invoices' },
    { id: 'draft', label: 'Draft' },
    { id: 'confirmed', label: 'Confirmed / Due' },
    { id: 'paid', label: 'Paid in Full' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  function handleExportCSV() {
    const headers = ['Invoice Number', 'Customer', 'Email', 'Invoice Date', 'Due Date', 'Status', 'Total Amount', 'Paid Amount', 'Balance Due'];
    const rows = invoices.map(i => [
      i.invoiceNumber,
      `"${(i.customerName || '').replace(/"/g, '""')}"`,
      i.customerEmail || '',
      i.invoiceDate,
      i.dueDate,
      i.status,
      i.totalAmount,
      i.paidAmount,
      i.balanceDue
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightloop_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isCustomer ? 'My Invoices & Payment Receipts' : 'Invoices & Recurring Billing'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated from subscriptions &bull; Real-time tax & discount application &bull; Audit-ready
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
            title="Export invoices list as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {!isCustomer && (
            <button
              onClick={onOpenBillingModal}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-current" />
              <span>Execute Billing Day Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Invoiced</span>
            <span className="text-2xl font-black text-slate-900 font-mono">${totalBilled.toFixed(2)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Outstanding Balance</span>
            <span className={`text-2xl font-black font-mono ${totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ${totalOutstanding.toFixed(2)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#714B67] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, customer..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#714B67]/20"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No invoices match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={inv.balanceDue > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {inv.dueDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                      ${Number(inv.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black">
                      <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        ${Number(inv.balanceDue).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {inv.balanceDue > 0 && inv.status !== 'cancelled' && (
                        <button
                          onClick={() => onOpenPayment(inv)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                        >
                          {isCustomer ? 'Pay Online' : 'Record Pay'}
                        </button>
                      )}
                      <button
                        onClick={() => onSelectInvoice(inv)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                        title="View / Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
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
