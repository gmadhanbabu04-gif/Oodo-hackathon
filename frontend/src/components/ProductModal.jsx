import React, { useState } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { api } from '../api';

export default function ProductModal({ isOpen, onClose, onProductCreated }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [type, setType] = useState('software');
  const [salesPrice, setSalesPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState([
    {
      attribute: 'Brand Edition',
      options: [
        { name: 'Standard Edition', priceDelta: 0 },
        { name: 'Odoo Powered Edition', priceDelta: 560 }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleAddOption(varIdx) {
    const updated = [...variants];
    updated[varIdx].options.push({ name: '', priceDelta: 0 });
    setVariants(updated);
  }

  function handleOptionChange(varIdx, optIdx, field, val) {
    const updated = [...variants];
    updated[varIdx].options[optIdx][field] = field === 'priceDelta' ? Number(val) : val;
    setVariants(updated);
  }

  function handleRemoveOption(varIdx, optIdx) {
    const updated = [...variants];
    updated[varIdx].options = updated[varIdx].options.filter((_, i) => i !== optIdx);
    setVariants(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createProduct({
        name,
        type,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice || 0),
        notes,
        variants
      });
      if (onProductCreated) onProductCreated();
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
            <Package className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Add Product & Variants</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BrightERP Cloud"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="software">Software</option>
                <option value="addon">Add-on</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sales Price ($)
              </label>
              <input
                type="number"
                required
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                placeholder="1200"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="400"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          {/* Variants section (e.g. Odoo brand +$560) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Variants & Price Adjustments (e.g. Odoo brand adds $560)
            </span>
            {variants.map((v, vIdx) => (
              <div key={vIdx} className="space-y-2">
                <input
                  type="text"
                  value={v.attribute}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[vIdx].attribute = e.target.value;
                    setVariants(updated);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                  placeholder="Attribute name (e.g. Brand Edition)"
                />
                <div className="space-y-1.5">
                  {v.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2 text-xs">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => handleOptionChange(vIdx, oIdx, 'name', e.target.value)}
                        placeholder="Option (e.g. Odoo Powered)"
                        className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white"
                      />
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400">+$</span>
                        <input
                          type="number"
                          value={opt.priceDelta}
                          onChange={(e) => handleOptionChange(vIdx, oIdx, 'priceDelta', e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono text-right bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(vIdx, oIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(vIdx)}
                    className="text-[11px] font-bold text-[#714B67] hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Variant Option</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Features, hardware specs, SLA notes..."
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
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
