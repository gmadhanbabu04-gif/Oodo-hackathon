import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle, Sparkles, Check } from 'lucide-react';
import { api } from '../api';

export default function SubscriptionModal({ isOpen, onClose, onSubscriptionCreated, currentUser }) {
  if (!isOpen) return null;

  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedDiscountId, setSelectedDiscountId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('immediate');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [initialStatus, setInitialStatus] = useState('quotation');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [uRes, pRes, prRes, tRes, dRes] = await Promise.all([
          api.getUsers('customer'),
          api.getPlans(),
          api.getProducts(),
          api.getQuotationTemplates(),
          api.getDiscounts()
        ]);
        setCustomers(uRes || []);
        setPlans(pRes || []);
        setProducts(prRes || []);
        setTemplates(tRes || []);
        setDiscounts((dRes || []).filter(d => d.isActive));

        if (currentUser?.role === 'customer') {
          setSelectedCustomerId(currentUser.id);
        } else if (uRes && uRes.length > 0) {
          setSelectedCustomerId(uRes[0].id);
        }

        if (pRes && pRes.length > 0) {
          setSelectedPlanId(pRes[0].id);
        }

        // Initialize 1 default product line
        if (prRes && prRes.length > 0) {
          const firstP = prRes[0];
          setLines([{
            id: 'line-' + Date.now(),
            productId: firstP.id,
            productName: firstP.name,
            variant: firstP.variants?.[0]?.options?.[0]?.name || null,
            variantPriceDelta: firstP.variants?.[0]?.options?.[0]?.priceDelta || 0,
            quantity: 1,
            unitPrice: firstP.salesPrice + (firstP.variants?.[0]?.options?.[0]?.priceDelta || 0)
          }]);
        }
      } catch (err) {
        console.error('Error fetching data for modal', err);
      }
    }
    fetchData();
  }, [currentUser]);

  // Load template lines if user picks a template
  function handleSelectTemplate(tmplId) {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find(t => t.id === tmplId);
    if (!tmpl) return;

    if (tmpl.planId) setSelectedPlanId(tmpl.planId);
    if (tmpl.notes) setNotes(tmpl.notes);

    // Calculate expiry based on validityDays
    if (tmpl.validityDays) {
      const exp = new Date();
      exp.setDate(exp.getDate() + tmpl.validityDays);
      setExpiryDate(exp.toISOString().split('T')[0]);
    }

    if (tmpl.lines && tmpl.lines.length > 0) {
      setLines(tmpl.lines.map((l, i) => ({
        id: 'line-' + Date.now() + '-' + i,
        productId: l.productId,
        productName: l.productName,
        variant: l.variant || null,
        variantPriceDelta: l.variantPriceDelta || 0,
        quantity: l.quantity || 1,
        unitPrice: l.unitPrice
      })));
    }
  }

  function handleAddLine() {
    if (products.length === 0) return;
    const p = products[0];
    const firstVariant = p.variants?.[0]?.options?.[0];
    const delta = firstVariant?.priceDelta || 0;

    setLines([
      ...lines,
      {
        id: 'line-' + Date.now(),
        productId: p.id,
        productName: p.name,
        variant: firstVariant?.name || null,
        variantPriceDelta: delta,
        quantity: 1,
        unitPrice: p.salesPrice + delta
      }
    ]);
  }

  function handleProductChange(index, productId) {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const updated = [...lines];
    const firstVariant = p.variants?.[0]?.options?.[0];
    const delta = firstVariant?.priceDelta || 0;

    updated[index] = {
      ...updated[index],
      productId: p.id,
      productName: p.name,
      variant: firstVariant?.name || null,
      variantPriceDelta: delta,
      unitPrice: p.salesPrice + delta
    };
    setLines(updated);
  }

  function handleVariantChange(index, variantName) {
    const updated = [...lines];
    const line = updated[index];
    const prod = products.find(p => p.id === line.productId);
    if (!prod) return;

    let delta = 0;
    prod.variants?.forEach(v => {
      const opt = v.options?.find(o => o.name === variantName);
      if (opt) delta = opt.priceDelta || 0;
    });

    updated[index] = {
      ...line,
      variant: variantName,
      variantPriceDelta: delta,
      unitPrice: prod.salesPrice + delta
    };
    setLines(updated);
  }

  function handleLineChange(index, field, value) {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  }

  function handleRemoveLine(index) {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  const subtotal = lines.reduce((sum, l) => sum + (Number(l.unitPrice || 0) * Number(l.quantity || 1)), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payloadLines = lines.map(l => ({
        ...l,
        amount: Number(l.unitPrice) * Number(l.quantity)
      }));

      await api.createSubscription({
        customerId: selectedCustomerId,
        planId: selectedPlanId,
        lines: payloadLines,
        paymentTerms,
        startDate,
        expiryDate: expiryDate || null,
        status: initialStatus,
        quotationTemplateId: selectedTemplateId || null,
        discountRuleId: selectedDiscountId || null,
        notes
      });

      if (onSubscriptionCreated) onSubscriptionCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#714B67] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Create Subscription / Quotation</h3>
            <p className="text-xs text-white/80">
              Configure product lines, variants, billing plans, and lifecycle terms
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Template Picker */}
          {templates.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#714B67]">
                <Sparkles className="w-4 h-4" />
                <span>Start from Quotation Template:</span>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-medium text-slate-800"
              >
                <option value="">-- Choose Template (Optional) --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.validityDays}d validity)</option>
                ))}
              </select>
            </div>
          )}

          {/* Customer & Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Account
              </label>
              {currentUser?.role === 'customer' ? (
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800">
                  {currentUser.name} ({currentUser.companyName || currentUser.email})
                </div>
              ) : (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName ? `${c.companyName} (${c.name})` : c.name} — {c.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subscription Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.cost}/{p.billingCycle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="immediate">Immediate Due</option>
                <option value="15_days">Net 15 Days</option>
                <option value="30_days">Net 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Pipeline Stage
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="draft">Draft</option>
                <option value="quotation">Quotation</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active (Direct Recurring)</option>
              </select>
            </div>
          </div>

          {/* Line Items Builder with Variant Selection (e.g. Odoo brand +560) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subscription Line Items & Variants
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-[#714B67] bg-purple-50 rounded-lg hover:bg-purple-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lines.map((line, idx) => {
                const prod = products.find(p => p.id === line.productId);
                const hasVariants = prod && prod.variants && prod.variants.length > 0;

                return (
                  <div key={line.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-5">
                      <select
                        value={line.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.salesPrice})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      {hasVariants ? (
                        <select
                          value={line.variant || ''}
                          onChange={(e) => handleVariantChange(idx, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-purple-200 bg-purple-50/50 text-[11px] font-medium"
                        >
                          {prod.variants.map(v => 
                            v.options?.map(o => (
                              <option key={o.name} value={o.name}>
                                {o.name} {o.priceDelta > 0 ? `(+$${o.priceDelta})` : ''}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] block text-center">Standard</span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-center bg-white"
                      />
                    </div>

                    <div className="col-span-1 font-mono font-bold text-slate-800 text-right">
                      ${(line.unitPrice * line.quantity).toFixed(0)}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discount Rule Attachment */}
          <div className="flex items-center justify-between pt-2">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Apply Discount Coupon (Optional)
              </label>
              <select
                value={selectedDiscountId}
                onChange={(e) => setSelectedDiscountId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
              >
                <option value="">No Discount</option>
                {discounts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) - {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`} Off
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Estimated Subtotal:</span>
              <span className="font-mono text-xl font-extrabold text-[#714B67]">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] disabled:opacity-50 shadow-md shadow-purple-900/10"
            >
              {loading ? 'Creating...' : 'Create Subscription Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
