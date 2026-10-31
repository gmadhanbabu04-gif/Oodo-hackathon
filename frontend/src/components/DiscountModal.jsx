import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { api } from '../api';

export default function DiscountModal({ isOpen, onClose, onDiscountCreated }) {
  if (!isOpen) return null;

  const [products, setProducts] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0);
  const [minQuantity, setMinQuantity] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [appliesToScope, setAppliesToScope] = useState('subscription');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProducts().then(res => setProducts(res || []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createDiscount({
        code,
        name,
        type,
        value: Number(value),
        minPurchaseAmount: Number(minPurchaseAmount),
        minQuantity: Number(minQuantity),
        startDate,
        endDate: endDate || null,
        usageLimit: Number(usageLimit),
        appliesToScope,
        productIds: appliesToScope === 'specific_product' ? selectedProductIds : []
      });
      if (onDiscountCreated) onDiscountCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(pId) {
    if (selectedProductIds.includes(pId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== pId));
    } else {
      setSelectedProductIds([...selectedProductIds, pId]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
        <div className="bg-[#714B67] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">New Discount Rule (Admin Only)</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SEATS20"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Volume Seat Incentive"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Value ({type === 'percentage' ? '%' : '$'})
              </label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percentage' ? '20' : '50'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                required
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Spend ($)
              </label>
              <input
                type="number"
                value={minPurchaseAmount}
                onChange={(e) => setMinPurchaseAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Quantity / Seats
              </label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Date
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
                End Date (Expires)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Scope: whole subscription or specific products */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Application Scope
            </label>
            <div className="flex space-x-4 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="scope"
                  value="subscription"
                  checked={appliesToScope === 'subscription'}
                  onChange={() => setAppliesToScope('subscription')}
                />
                <span>Whole Subscription Total</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="scope"
                  value="specific_product"
                  checked={appliesToScope === 'specific_product'}
                  onChange={() => setAppliesToScope('specific_product')}
                />
                <span>Specific Products Only</span>
              </label>
            </div>

            {appliesToScope === 'specific_product' && (
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Select Applicable Products:
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                      />
                      <span>{p.name} (${p.salesPrice})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
              {loading ? 'Creating...' : 'Create Discount Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
