import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  FileText, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function CustomerPortalView({ 
  currentUser, 
  onSelectInvoice, 
  onOpenPayment, 
  onOpenNewSubscription,
  setView 
}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortalData() {
      setLoading(true);
      try {
        const [subRes, invRes] = await Promise.all([
          api.getSubscriptions(),
          api.getInvoices()
        ]);
        setSubscriptions(subRes || []);
        setInvoices(invRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPortalData();
  }, []);

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pendingQuotes = subscriptions.filter(s => s.status === 'quotation');
  const unpaidInvoices = invoices.filter(i => (i.balanceDue || 0) > 0 && i.status !== 'cancelled');
  const totalBalanceDue = unpaidInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#714B67] to-[#017E84] rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-sm">
            Customer Self-Service Portal
          </span>
          <h2 className="text-2xl font-black mt-1">Welcome, {currentUser?.name || 'Customer'}</h2>
          <p className="text-xs text-white/80 mt-1">
            {currentUser?.companyName} &bull; Manage your active software licenses, quotes, and billing directly
          </p>
        </div>

        <button
          onClick={onOpenNewSubscription}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#714B67] hover:bg-slate-50 shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Subscribe to New Add-on / Plan</span>
        </button>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Services</span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{activeSubs.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{pendingQuotes.length} quotation(s) pending</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoices</span>
            <FileText className="w-4 h-4 text-[#714B67]" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{invoices.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {invoices.filter(i => i.status === 'paid').length} paid receipts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className={`mt-2 text-2xl font-black font-mono ${totalBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ${totalBalanceDue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {unpaidInvoices.length > 0 ? `${unpaidInvoices.length} invoice(s) due` : 'All accounts settled'}
          </div>
        </div>
      </div>

      {/* Outstanding Invoices Alert if any */}
      {unpaidInvoices.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                You have {unpaidInvoices.length} invoice(s) awaiting settlement (${totalBalanceDue.toFixed(2)})
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Pay online using credit card or instant wire transfer without having to email accounting.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenPayment(unpaidInvoices[0])}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
          >
            Pay Invoice {unpaidInvoices[0].invoiceNumber}
          </button>
        </div>
      )}

      {/* Active Subscriptions List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">My Subscriptions & Licenses</h3>
          <button
            onClick={() => setView('subscriptions')}
            className="text-xs font-bold text-[#714B67] hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">You have no subscriptions yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#714B67]">{s.subscriptionNumber}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="font-bold text-sm text-slate-800">{s.planName}</div>
                <div className="text-xs text-slate-500">
                  Next recurring billing: <strong className="text-slate-700 font-mono">{s.nextBillingDate || '—'}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">{s.lines?.length || 0} product line(s)</span>
                  {s.canPause && s.status === 'active' && (
                    <span className="text-[11px] font-semibold text-purple-700">Pauseable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Invoices</h3>
          <button
            onClick={() => setView('invoices')}
            className="text-xs font-bold text-[#714B67] hover:underline flex items-center space-x-1"
          >
            <span>View All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-2.5">Invoice #</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Total</th>
                <th className="pb-2.5 text-right">Balance Due</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono font-bold text-[#714B67]">{inv.invoiceNumber}</td>
                  <td className="py-2.5 font-mono text-slate-600">{inv.invoiceDate}</td>
                  <td className="py-2.5"><StatusBadge status={inv.status} /></td>
                  <td className="py-2.5 text-right font-mono font-semibold">${inv.totalAmount.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-mono font-black">
                    <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ${inv.balanceDue.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 text-right space-x-1">
                    {inv.balanceDue > 0 && inv.status !== 'cancelled' && (
                      <button
                        onClick={() => onOpenPayment(inv)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        Pay Online
                      </button>
                    )}
                    <button
                      onClick={() => onSelectInvoice(inv)}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
