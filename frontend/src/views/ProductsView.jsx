import React, { useState, useEffect } from 'react';
import { Plus, Package, Layers, Sparkles, DollarSign } from 'lucide-react';
import { api } from '../api';

export default function ProductsView({ onOpenNewProduct, currentUser }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const isAdminOrStaff = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Products & Variants Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Software licenses, add-ons, and variant options (e.g. Odoo brand edition price delta)
          </p>
        </div>

        {isAdminOrStaff && (
          <button
            onClick={onOpenNewProduct}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const margin = p.salesPrice - p.costPrice;
            const marginPct = p.salesPrice > 0 ? ((margin / p.salesPrice) * 100).toFixed(0) : 0;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700">
                        {p.type}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{p.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-black text-[#714B67]">
                        ${p.salesPrice}
                      </div>
                      <div className="text-[10px] text-slate-400">Base Price</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.notes || 'No description'}</p>

                  {/* Variants display (e.g. Brand edition +560) */}
                  {p.variants && p.variants.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Available Variants:
                      </span>
                      {p.variants.map((v, vIdx) => (
                        <div key={vIdx} className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500">{v.attribute}:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(v.options || []).map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                                  opt.name.includes('Odoo')
                                    ? 'bg-purple-50 text-[#714B67] border-purple-200 shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {opt.name} {opt.priceDelta > 0 ? `(+$${opt.priceDelta})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Cost: <strong className="text-slate-700 font-mono">${p.costPrice}</strong></span>
                  <span className="text-emerald-600 font-bold">Margin: {marginPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
