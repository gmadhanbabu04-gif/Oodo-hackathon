import React, { useState, useEffect } from 'react';
import { Plus, CalendarCheck, Check, X, Shield, Clock } from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function PlansView({ onOpenNewPlan, currentUser }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await api.getPlans();
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Plans & Recurring Cycles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin-defined billing intervals (daily, weekly, monthly, yearly) and contract lifecycle rules
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenNewPlan}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan (Admin)</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={p.billingCycle} />
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{p.code}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || 'Flexible recurring plan'}</p>

                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="font-mono text-3xl font-black text-[#714B67]">${p.cost}</span>
                  <span className="text-xs text-slate-500">/{p.billingCycle}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  Minimum Seats / Qty: <strong className="text-slate-800">{p.minQuantity || 1}</strong>
                </div>

                {/* Plan Lifecycle Policies Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1.5">
                  <span className="font-bold text-slate-600 uppercase tracking-wider block">Lifecycle Rules:</span>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Auto-close on end:</span>
                    {p.autoCloseOnEnd ? (
                      <span className="text-emerald-600 font-bold flex items-center"><Check className="w-3 h-3 mr-0.5" /> Yes</span>
                    ) : (
                      <span className="text-slate-400 flex items-center"><X className="w-3 h-3 mr-0.5" /> No</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Can close early:</span>
                    {p.canCloseEarly ? (
                      <span className="text-emerald-600 font-bold flex items-center"><Check className="w-3 h-3 mr-0.5" /> Allowed</span>
                    ) : (
                      <span className="text-rose-500 font-semibold flex items-center"><X className="w-3 h-3 mr-0.5" /> Locked</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Can pause billing:</span>
                    {p.canPause ? (
                      <span className="text-emerald-600 font-bold flex items-center"><Check className="w-3 h-3 mr-0.5" /> Allowed</span>
                    ) : (
                      <span className="text-slate-400 flex items-center"><X className="w-3 h-3 mr-0.5" /> No</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Can renew:</span>
                    {p.canRenew ? (
                      <span className="text-emerald-600 font-bold flex items-center"><Check className="w-3 h-3 mr-0.5" /> Yes</span>
                    ) : (
                      <span className="text-slate-400 flex items-center"><X className="w-3 h-3 mr-0.5" /> No</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                <span>Valid: {p.startDate}</span>
                <span>{p.endDate ? `to ${p.endDate}` : 'Ongoing'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
