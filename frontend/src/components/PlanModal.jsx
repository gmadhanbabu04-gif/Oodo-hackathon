import React, { useState } from 'react';
import { X, CalendarCheck } from 'lucide-react';
import { api } from '../api';

export default function PlanModal({ isOpen, onClose, onPlanCreated }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [minQuantity, setMinQuantity] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [canCloseEarly, setCanCloseEarly] = useState(true);
  const [canPause, setCanPause] = useState(true);
  const [canRenew, setCanRenew] = useState(true);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createPlan({
        name,
        cost: Number(cost),
        billingCycle,
        minQuantity: Number(minQuantity),
        startDate,
        endDate: endDate || null,
        autoCloseOnEnd,
        canCloseEarly,
        canPause,
        canRenew,
        description
      });
      if (onPlanCreated) onPlanCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
        <div className="bg-[#714B67] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Create Subscription Plan</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Monthly Growth"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Base Cost ($)
              </label>
              <input
                type="number"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="299"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Seats / Qty
              </label>
              <input
                type="number"
                min="1"
                required
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Available Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Available End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Lifecycle control switches decided plan by plan */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Plan Lifecycle Policies (Admin Defined)
            </span>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCloseOnEnd}
                onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span><strong>Auto-close on end:</strong> Terminates automatically when end date is reached</span>
            </label>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={canCloseEarly}
                onChange={(e) => setCanCloseEarly(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span><strong>Can close early:</strong> Customer/staff can terminate before expiry</span>
            </label>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={canPause}
                onChange={(e) => setCanPause(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span><strong>Can pause:</strong> Customer/staff can temporarily halt billing</span>
            </label>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={canRenew}
                onChange={(e) => setCanRenew(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span><strong>Can renew:</strong> Allows extending term or setting automatic renewal</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Target audience, tier features..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {error && <div className="text-rose-600 text-xs font-medium">{error}</div>}

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952]"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
