import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, ShieldCheck, Percent, DollarSign } from 'lucide-react';
import { api } from '../api';

export default function DiscountsView({ onOpenNewDiscount, currentUser }) {
  const [discounts, setDiscounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [dRes, tRes] = await Promise.all([
        api.getDiscounts(),
        api.getTaxes()
      ]);
      setDiscounts(dRes || []);
      setTaxes(tRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteDiscount(id) {
    if (!window.confirm('Delete this discount rule?')) return;
    try {
      await api.deleteDiscount(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Discounts & Automatic Tax Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin-controlled coupons, minimum spend/seat thresholds, usage meters, and jurisdictional tax rates
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenNewDiscount}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discount Rule</span>
          </button>
        )}
      </div>

      {/* Tax Rules Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Admin Tax Calculation Rules</h3>
            <p className="text-xs text-slate-500">Automatically evaluated during billing runs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {taxes.map((t) => (
            <div key={t.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-800">{t.name}</span>
                  {t.isDefault && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Default</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t.description}</div>
              </div>
              <div className="text-base font-black font-mono text-[#017E84]">
                {t.rate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Rules Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Active Discount & Seat Incentive Rules</h3>
          <p className="text-xs text-slate-500">
            Enforces limits on seat quantity, minimum spend, expiry date, and total usage count.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading discount rules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Conditions</th>
                  <th className="py-3 px-4">Usage Counter</th>
                  <th className="py-3 px-4">Validity</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((d) => {
                  const isExhausted = d.usageLimit && (d.timesUsed || 0) >= d.usageLimit;
                  const isExpired = d.endDate && new Date(d.endDate) < new Date();

                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#714B67]">
                        {d.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {d.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        {d.type === 'percentage' ? `${d.value}% Off` : `$${d.value} Fixed Off`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {d.appliesToScope === 'specific_product' ? 'Specific Product' : 'Whole Subscription'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-600">
                        {d.minPurchaseAmount > 0 && <div>Min Spend: ${d.minPurchaseAmount}</div>}
                        {d.minQuantity > 0 && <div>Min Qty: {d.minQuantity} seats</div>}
                        {!d.minPurchaseAmount && !d.minQuantity && <div>No min threshold</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {d.timesUsed || 0} / {d.usageLimit || '∞'}
                        {isExhausted && (
                          <span className="block text-[10px] text-rose-600 font-bold uppercase">Limit Reached</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {d.endDate ? `Ends ${d.endDate}` : 'No expiry'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteDiscount(d.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete Discount"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
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
