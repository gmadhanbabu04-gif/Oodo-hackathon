import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  ArrowRight, 
  Pause, 
  Play, 
  XCircle, 
  FileText, 
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function SubscriptionsView({ onOpenNewSubscription, currentUser }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubId, setExpandedSubId] = useState(null);

  const isCustomer = currentUser?.role === 'customer';

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const data = await api.getSubscriptions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      setSubscriptions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter, searchQuery]);

  async function handleStatusAdvance(sub, nextStatus) {
    try {
      await api.updateSubscriptionStatus(sub.id, nextStatus);
      loadSubscriptions();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handlePauseToggle(sub) {
    try {
      await api.togglePauseSubscription(sub.id);
      loadSubscriptions();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCloseEarly(sub) {
    if (!window.confirm(`Are you sure you want to close subscription ${sub.subscriptionNumber} early?`)) return;
    try {
      await api.closeEarlySubscription(sub.id);
      loadSubscriptions();
    } catch (err) {
      alert(err.message);
    }
  }

  const stages = [
    { id: 'all', label: 'All Records' },
    { id: 'draft', label: 'Drafts' },
    { id: 'quotation', label: 'Quotations' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'active', label: 'Active Contracts' },
    { id: 'paused', label: 'Paused' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isCustomer ? 'My Subscriptions & Quotes' : 'Subscription & Quotation Pipeline'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle progression: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed
          </p>
        </div>

        <button
          onClick={onOpenNewSubscription}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isCustomer ? 'Subscribe to New Plan' : 'Create Quote / Subscription'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st.id
                  ? 'bg-[#714B67] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search #, customer, plan..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#714B67]/20"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700">No subscriptions found</div>
            <p>Try switching filters or create a new subscription offer above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Subscription #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan & Terms</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Billing</th>
                  <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => {
                  const isExpanded = expandedSubId === sub.id;
                  const totalAmount = (sub.lines || []).reduce((sum, l) => sum + (l.unitPrice * l.quantity), 0);

                  return (
                    <React.Fragment key={sub.id}>
                      <tr
                        onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                          {sub.subscriptionNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.customerName}</div>
                          <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{sub.planName}</div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            Terms: {sub.paymentTerms?.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {sub.nextBillingDate || sub.startDate || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Pipeline progression controls */}
                          {sub.status === 'draft' && (
                            <button
                              onClick={() => handleStatusAdvance(sub, 'quotation')}
                              className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200"
                              title="Send quotation to client"
                            >
                              Send Quote &rarr;
                            </button>
                          )}

                          {sub.status === 'quotation' && (
                            <button
                              onClick={() => handleStatusAdvance(sub, 'confirmed')}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                              title="Customer accepts quote"
                            >
                              Confirm Quote &rarr;
                            </button>
                          )}

                          {sub.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusAdvance(sub, 'active')}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                              title="Activate recurring billing engine"
                            >
                              Activate Contract &rarr;
                            </button>
                          )}

                          {/* Pause / Resume */}
                          {sub.status === 'active' && sub.canPause && (
                            <button
                              onClick={() => handlePauseToggle(sub)}
                              className="px-2 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200"
                              title="Pause recurring billing"
                            >
                              <Pause className="w-3 h-3 inline mr-1" />
                              Pause
                            </button>
                          )}

                          {sub.status === 'paused' && (
                            <button
                              onClick={() => handlePauseToggle(sub)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                              title="Resume subscription"
                            >
                              <Play className="w-3 h-3 inline mr-1" />
                              Resume
                            </button>
                          )}

                          {/* Close Early */}
                          {(sub.status === 'active' || sub.status === 'paused') && sub.canCloseEarly && (
                            <button
                              onClick={() => handleCloseEarly(sub)}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                              title="Terminate subscription early"
                            >
                              <XCircle className="w-3 h-3 inline mr-1" />
                              Close
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Line Items & Lifecycle Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={6} className="p-4 space-y-3">
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                              <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                Subscribed Products & Variants
                              </span>
                              <div className="space-y-1.5">
                                {(sub.lines || []).map((line, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-slate-800">{line.productName}</span>
                                      {line.variant && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-[#714B67] border border-purple-200">
                                          {line.variant}
                                        </span>
                                      )}
                                      <span className="text-slate-400">&times; {line.quantity}</span>
                                    </div>
                                    <span className="font-mono font-bold text-slate-900">
                                      ${(line.unitPrice * line.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                                <span>Recurring Subtotal:</span>
                                <span className="font-mono text-[#714B67]">${totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
