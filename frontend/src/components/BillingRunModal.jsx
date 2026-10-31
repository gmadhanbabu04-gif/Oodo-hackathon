import React, { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function BillingRunModal({ isOpen, onClose, onBillingComplete }) {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleRun() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.runBilling(targetDate);
      setResult(res);
      if (onBillingComplete) onBillingComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#714B67] to-[#017E84] text-white p-6 relative">
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Zap className="w-6 h-6 text-amber-300 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Billing Day Automated Engine</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Evaluates due subscriptions, calculates taxes, applies discounts & generates invoices
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {!result ? (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Double-Billing Prevention Guard (Idempotency)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The engine scans all <strong>Active</strong> subscriptions whose next billing date is on or before your selected date. If an invoice for this period was already generated, the engine guarantees it is <strong>never billed twice</strong> and <strong>never skipped</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Billing Run Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Subscriptions with next billing date &le; {targetDate} will be processed.
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] disabled:opacity-50 shadow-md shadow-purple-900/10"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                  <span>{loading ? 'Processing Billing...' : 'Execute Billing Run Now'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Execution Results */
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-emerald-600 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Billing run finished successfully for target date {result.targetDate}!</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-[#714B67]">
                    {result.generatedInvoices.length}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                    Invoices Created
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-slate-700">
                    {result.skippedSubscriptions.length}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                    Protected / Skipped
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-amber-600">
                    {result.closedSubscriptions.length}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mt-0.5">
                    Expired Auto-Closed
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              {result.generatedInvoices.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-white max-h-48 overflow-y-auto">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Generated Invoices
                  </h4>
                  <div className="space-y-2">
                    {result.generatedInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <div className="font-semibold text-slate-800">
                          {inv.invoiceNumber} <span className="text-slate-400 font-normal">({inv.customerName})</span>
                        </div>
                        <div className="font-mono font-bold text-[#017E84]">
                          ${inv.totalAmount?.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped Details */}
              {result.skippedSubscriptions.length > 0 && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Skipped items: </span>
                  {result.skippedSubscriptions.map(s => `${s.number} (${s.reason})`).join(', ')}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952]"
                >
                  Done & Refresh Views
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
