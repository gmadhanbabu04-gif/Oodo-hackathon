import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Compass, 
  DollarSign, 
  Repeat,
  Zap
} from 'lucide-react';
import { api } from '../api';

export default function SmartActionCenterView({ setView }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntelligence() {
      setLoading(true);
      try {
        const res = await api.getIntelligence();
        setIntel(res);
      } catch (err) {
        console.error('Error fetching intelligence', err);
      } finally {
        setLoading(false);
      }
    }
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-semibold">
        <Zap className="w-5 h-5 animate-spin mr-2 text-[#714B67]" />
        Evaluating contract health, overdue risks, and predictive revenue models...
      </div>
    );
  }

  const actions = intel?.smartActions || [];
  const risks = intel?.renewalRisks || [];
  const forecast = intel?.revenueForecast || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#714B67] text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-sm">
              SubscriptIQ Intelligence Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Live Evaluation Active
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Smart Action Center & Renewal Risk Intelligence</h2>
          <p className="text-xs text-white/80 mt-1">
            Explainable AI-driven risk scoring &bull; Prioritized operational action queue &bull; 6-month revenue forecasting
          </p>
        </div>
      </div>

      {/* Prioritized Operational Queue */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Prioritized Action Queue (High Impact First)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((act) => (
            <div
              key={act.id}
              className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between space-y-3 ${
                act.priority === 'high' ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    act.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {act.priority} Priority
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">{act.category}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">{act.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setView(act.targetView)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-[#714B67] hover:underline"
                >
                  <span>{act.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Risk Intelligence Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Explainable Renewal Risk Intelligence</h3>
          <p className="text-xs text-slate-500">
            Automated churn prevention algorithm classifying customer contract renewal health based on overdue balances and term proximity.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Classification Signals & Reasons</th>
                <th className="py-3 px-4">Recommended Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {risks.map((r) => {
                const badgeColor = {
                  high: 'bg-rose-100 text-rose-800 border-rose-300',
                  medium: 'bg-amber-100 text-amber-800 border-amber-300',
                  low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }[r.category];

                return (
                  <tr key={r.subscriptionId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                      {r.subscriptionNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.customerName}</div>
                      <div className="text-[11px] text-slate-400">{r.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeColor}`}>
                        {r.category} Risk
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-800">
                      {r.riskScore} / 100
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 space-y-0.5 max-w-xs">
                      {r.reasons.length > 0 ? (
                        r.reasons.map((rsn, idx) => (
                          <div key={idx} className="text-[11px] flex items-start space-x-1">
                            <span className="text-slate-400">&bull;</span>
                            <span>{rsn}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Contract and payment ledger fully up to date.</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-[11px] font-medium max-w-xs">
                      {r.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6-Month Predictive Revenue Forecast */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#714B67]" />
            <span>6-Month Predictive Recurring Revenue Forecast</span>
          </h3>
          <p className="text-xs text-slate-500">
            Normalizes active Monthly Recurring Revenue (MRR) baseline combined with expected annual contract renewals.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {forecast.map((fc, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">{fc.month}</span>
              <span className="text-base font-black font-mono text-[#714B67] block">
                ${fc.projectedRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 block">
                +{fc.growthRatePct}% Growth
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
