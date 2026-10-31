import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Repeat, 
  DollarSign, 
  Archive, 
  ChevronLeft, 
  ChevronRight,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { api } from '../api';

export default function CustomersView({ onOpenNewCustomer, onSelectCustomer, setView }) {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res = await api.getCustomers({
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 8
      });
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [page, search, statusFilter]);

  async function handleArchive(id, name) {
    if (!window.confirm(`Archive customer "${name}"? Their subscription and invoice history will be safely preserved.`)) return;
    try {
      await api.archiveCustomer(id);
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Lifecycle & Accounts</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized client registry &bull; Account status, recurring subscription volume, and balance ledger
          </p>
        </div>

        <button
          onClick={onOpenNewCustomer}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex space-x-1">
          {['all', 'active', 'lead', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#714B67] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, company, email..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#714B67]/20"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading customer accounts...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Customer & Business</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Active Subs</th>
                  <th className="py-3 px-4 text-right">Outstanding Due</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.companyName}</div>
                      <div className="text-slate-500 text-[11px] font-medium flex items-center space-x-1 mt-0.5">
                        <span>Attn: {c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-slate-700 font-mono text-[11px]">{c.email}</div>
                      <div className="text-slate-400 text-[11px]">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-[#714B67] border border-purple-200">
                        <Repeat className="w-3 h-3 mr-1" />
                        {c.activeSubscriptionsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={c.totalOutstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        ${Number(c.totalOutstandingBalance).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        c.accountStatus === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.accountStatus === 'lead'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {c.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setView('subscriptions')}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#714B67] bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                        title="View client subscriptions"
                      >
                        Subscriptions
                      </button>
                      {c.accountStatus !== 'archived' && (
                        <button
                          onClick={() => handleArchive(c.id, c.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Archive customer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing page {page} of {totalPages} ({total} total customers)</span>
            <div className="flex space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
