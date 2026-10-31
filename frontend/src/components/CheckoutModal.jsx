import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Tag, 
  Sparkles, 
  Lock, 
  ArrowRight,
  Package,
  Layers
} from 'lucide-react';
import { api } from '../api';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  initialPlan, 
  onPurchaseComplete, 
  currentUser 
}) {
  if (!isOpen) return null;

  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan?.id || '');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantPriceDelta, setVariantPriceDelta] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState(null);

  // Card details simulation
  const [cardName, setCardName] = useState(currentUser?.name || 'Authorized Buyer');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initData() {
      try {
        const [pRes, prodRes] = await Promise.all([
          api.getPlans(),
          api.getProducts()
        ]);
        setPlans(pRes || []);
        setProducts(prodRes || []);

        const targetPlan = initialPlan || pRes?.[0];
        if (targetPlan) {
          setSelectedPlanId(targetPlan.id);
          setQuantity(targetPlan.minQuantity || 1);
        }

        if (prodRes && prodRes.length > 0) {
          const firstP = prodRes[0];
          setSelectedProductId(firstP.id);
          // Check if Odoo variant exists
          const brandAttr = firstP.variants?.find(v => v.attribute === 'Brand Edition');
          const odooOpt = brandAttr?.options?.find(o => o.name.includes('Odoo'));
          if (odooOpt) {
            setSelectedVariant(odooOpt.name);
            setVariantPriceDelta(odooOpt.priceDelta || 560);
          } else if (brandAttr?.options?.[0]) {
            setSelectedVariant(brandAttr.options[0].name);
            setVariantPriceDelta(brandAttr.options[0].priceDelta || 0);
          }
        }
      } catch (err) {
        console.error('Error loading checkout resources', err);
      }
    }
    initData();
  }, [initialPlan]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || initialPlan || {};
  const selectedProduct = products.find(p => p.id === selectedProductId) || {};

  // Calculate pricing
  const basePrice = Number(selectedProduct.salesPrice || selectedPlan.cost || 0);
  const unitPrice = basePrice + Number(variantPriceDelta || 0);
  const subtotal = Math.round(unitPrice * Number(quantity || 1) * 100) / 100;

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedDiscount.value) / 100 * 100) / 100;
    } else {
      discountAmount = Math.min(appliedDiscount.value, subtotal);
    }
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = 10.0; // 10%
  const taxAmount = Math.round((netSubtotal * 0.10) * 100) / 100;
  const totalDue = Math.round((netSubtotal + taxAmount) * 100) / 100;

  async function handleApplyCoupon() {
    setDiscountError(null);
    if (!discountCode.trim()) return;

    try {
      const allDiscounts = await api.getDiscounts();
      const codeClean = discountCode.toUpperCase().trim();
      const match = allDiscounts.find(d => d.code === codeClean && d.isActive);

      if (!match) {
        setDiscountError('Invalid or inactive coupon code.');
        setAppliedDiscount(null);
        return;
      }

      if (match.minPurchaseAmount && subtotal < match.minPurchaseAmount) {
        setDiscountError(`Coupon requires minimum spend of $${match.minPurchaseAmount}.`);
        setAppliedDiscount(null);
        return;
      }

      setAppliedDiscount(match);
      setDiscountError(null);
    } catch (err) {
      setDiscountError(err.message);
    }
  }

  async function handlePurchase(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.checkoutSubscription({
        planId: selectedPlanId,
        productId: selectedProductId,
        variant: selectedVariant,
        variantPriceDelta,
        quantity: Number(quantity),
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        paymentMethod
      });

      if (onPurchaseComplete) onPurchaseComplete(res);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#714B67] to-[#017E84] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <CreditCard className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Instant Subscription Checkout</h3>
              <p className="text-xs text-white/80">
                Direct customer purchase &bull; Automated activation &bull; Instant receipt
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePurchase} className="p-6 space-y-5">
          {/* Plan & Product Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subscription Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
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
                Software Edition / Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  const firstOpt = p?.variants?.[0]?.options?.[0];
                  setSelectedVariant(firstOpt?.name || null);
                  setVariantPriceDelta(firstOpt?.priceDelta || 0);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              >
                {products.map(pr => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name} (Base ${pr.salesPrice})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Variant Picker (with Odoo Brand +$560 highlight) */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="md:col-span-2 bg-purple-50/50 border border-purple-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-[#714B67] uppercase tracking-wider block mb-1.5">
                  Select Edition Variant:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedProduct.variants[0].options?.map((opt) => {
                    const isSelected = selectedVariant === opt.name;
                    return (
                      <button
                        type="button"
                        key={opt.name}
                        onClick={() => {
                          setSelectedVariant(opt.name);
                          setVariantPriceDelta(opt.priceDelta);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#714B67] text-white border-[#714B67] shadow-sm font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-semibold">{opt.name}</div>
                        <div className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                          {opt.priceDelta > 0 ? `+$${opt.priceDelta}` : 'Included in base'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Seats / Licenses
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={selectedPlan.minQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(selectedPlan.minQuantity || 1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center"
                />
                <span className="text-xs text-slate-500">
                  Min: {selectedPlan.minQuantity || 1} seat(s)
                </span>
              </div>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Promo Code / Discount Coupon
              </label>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  placeholder="e.g. GROWTH20 or SEAT50"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount && (
                <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                  ✓ {appliedDiscount.name} applied (-${discountAmount.toFixed(2)})
                </span>
              )}
              {discountError && (
                <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                  {discountError}
                </span>
              )}
            </div>
          </div>

          {/* Payment Card Simulation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulated Secure Payment Method</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">256-Bit SSL Encrypted</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-slate-500 block text-[11px] mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[11px] mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block text-[11px] mb-1">Exp Date</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px] mb-1">CVC</label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-center font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="bg-slate-100/80 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>{selectedProduct.name || selectedPlan.name} ({quantity} seat{quantity > 1 ? 's' : ''}):</span>
              <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Standard Tax (10% VAT):</span>
              <span className="font-mono font-medium">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900 font-extrabold text-base">
              <span>Total Amount Due:</span>
              <span className="font-mono text-xl text-[#714B67]">${totalDue.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end space-x-3 pt-2">
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
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#714B67] to-[#017E84] hover:opacity-95 shadow-md shadow-purple-900/10 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Processing Purchase...' : `Pay $${totalDue.toFixed(2)} & Activate Subscription`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
