const db = require('./database');

/**
 * Calculates due date based on payment terms
 */
function calculateDueDate(fromDate, paymentTerms) {
  const date = new Date(fromDate);
  if (paymentTerms === '15_days') {
    date.setDate(date.getDate() + 15);
  } else if (paymentTerms === '30_days') {
    date.setDate(date.getDate() + 30);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Advances next billing date based on billing cycle
 */
function advanceBillingDate(currentBillingDate, billingCycle) {
  const d = new Date(currentBillingDate || new Date());
  switch (billingCycle) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'monthly':
    default:
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d.toISOString().split('T')[0];
}

/**
 * Evaluates discount applicability
 */
function evaluateDiscount(discountRule, subtotal, totalQuantity, lines) {
  if (!discountRule || !discountRule.isActive) {
    return { valid: false, reason: 'Inactive discount' };
  }

  const now = new Date();
  if (discountRule.startDate && new Date(discountRule.startDate) > now) {
    return { valid: false, reason: 'Discount has not started yet' };
  }
  if (discountRule.endDate && new Date(discountRule.endDate) < now) {
    return { valid: false, reason: 'Discount expired' };
  }
  if (discountRule.usageLimit && (discountRule.timesUsed || 0) >= discountRule.usageLimit) {
    return { valid: false, reason: 'Usage limit reached' };
  }
  if (discountRule.minPurchaseAmount && subtotal < discountRule.minPurchaseAmount) {
    return { valid: false, reason: `Minimum purchase of $${discountRule.minPurchaseAmount} not met` };
  }
  if (discountRule.minQuantity && totalQuantity < discountRule.minQuantity) {
    return { valid: false, reason: `Minimum quantity of ${discountRule.minQuantity} items not met` };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discountRule.appliesToScope === 'specific_product' && Array.isArray(discountRule.productIds)) {
    const applicableLines = lines.filter(l => discountRule.productIds.includes(l.productId));
    const targetSubtotal = applicableLines.reduce((sum, l) => sum + (l.unitPrice * l.quantity), 0);
    if (discountRule.type === 'percentage') {
      discountAmount = (targetSubtotal * discountRule.value) / 100;
    } else {
      discountAmount = Math.min(discountRule.value, targetSubtotal);
    }
  } else {
    // Whole subscription
    if (discountRule.type === 'percentage') {
      discountAmount = (subtotal * discountRule.value) / 100;
    } else {
      discountAmount = Math.min(discountRule.value, subtotal);
    }
  }

  return {
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
}

/**
 * Runs the Recurring Billing Engine for due subscriptions
 * Idempotent: Never bills twice for the same billing period, never skips.
 */
function runBillingEngine(options = {}) {
  const targetDateStr = options.targetDate || new Date().toISOString().split('T')[0];
  const targetDate = new Date(targetDateStr);

  const activeSubscriptions = db.getAll('subscriptions').filter(sub => sub.status === 'active');
  const taxRules = db.getAll('taxRules').filter(t => t.isDefault || t.isActive);
  const defaultTaxRate = taxRules.length > 0 ? taxRules[0].rate : 0;

  const generatedInvoices = [];
  const skippedSubscriptions = [];
  const closedSubscriptions = [];

  for (const sub of activeSubscriptions) {
    const plan = db.getById('plans', sub.planId);
    const customer = db.getById('users', sub.customerId);

    // Check expiry
    if (sub.expiryDate && new Date(sub.expiryDate) < targetDate) {
      if (sub.autoCloseOnEnd) {
        db.update('subscriptions', sub.id, { status: 'closed', closedAt: targetDateStr });
        closedSubscriptions.push({ id: sub.id, number: sub.subscriptionNumber, reason: 'Expired and auto-closed' });
        continue;
      }
    }

    const nextBilling = sub.nextBillingDate || sub.startDate;
    // Only bill if billing date is on or before target date
    if (new Date(nextBilling) > targetDate) {
      continue;
    }

    // Determine billing period
    const billingPeriodStart = nextBilling;
    const nextBillingDate = advanceBillingDate(billingPeriodStart, plan?.billingCycle || 'monthly');
    const billingPeriodEnd = nextBillingDate;

    // IDEMPOTENCY CHECK: Ensure this subscription was NOT already billed for this exact period
    const existingInvoice = db.findOne('invoices', inv => 
      inv.subscriptionId === sub.id && 
      inv.billingPeriodStart === billingPeriodStart &&
      inv.status !== 'cancelled'
    );

    if (existingInvoice) {
      skippedSubscriptions.push({
        id: sub.id,
        number: sub.subscriptionNumber,
        reason: `Already billed under invoice ${existingInvoice.invoiceNumber} for period ${billingPeriodStart} to ${billingPeriodEnd}`
      });
      continue;
    }

    // Calculate line items with variants & prices
    let subtotal = 0;
    let totalQty = 0;
    const invoiceLines = (sub.lines || []).map(line => {
      const product = db.getById('products', line.productId) || {};
      let unitPrice = Number(line.unitPrice || product.salesPrice || 0);
      
      // If variant has price delta
      if (line.variantPriceDelta) {
        unitPrice += Number(line.variantPriceDelta);
      }
      
      const qty = Number(line.quantity || 1);
      const lineSubtotal = unitPrice * qty;
      subtotal += lineSubtotal;
      totalQty += qty;

      return {
        productId: line.productId,
        productName: product.name || line.productName || 'Subscription Line',
        variant: line.variant || null,
        quantity: qty,
        unitPrice: Math.round(unitPrice * 100) / 100,
        amount: Math.round(lineSubtotal * 100) / 100
      };
    });

    // Check if subscription has an active discount rule
    let discountTotal = 0;
    let discountAppliedNote = null;
    if (sub.discountRuleId) {
      const rule = db.getById('discountRules', sub.discountRuleId);
      const evalRes = evaluateDiscount(rule, subtotal, totalQty, invoiceLines);
      if (evalRes.valid) {
        discountTotal = evalRes.discountAmount;
        discountAppliedNote = `${rule.name} (${rule.code}): -$${discountTotal}`;
        // Increment usage count
        db.update('discountRules', rule.id, {
          timesUsed: (rule.timesUsed || 0) + 1
        });
      }
    }

    const netSubtotal = Math.max(0, subtotal - discountTotal);
    // Calculate taxes
    const taxRate = Number(sub.taxRate !== undefined ? sub.taxRate : defaultTaxRate);
    const taxTotal = Math.round((netSubtotal * (taxRate / 100)) * 100) / 100;
    const totalAmount = Math.round((netSubtotal + taxTotal) * 100) / 100;

    const dueDate = calculateDueDate(targetDateStr, sub.paymentTerms);

    // Create Invoice
    const invoiceNumber = db.getNextNumber('invoice');
    const newInvoice = db.create('invoices', {
      invoiceNumber,
      subscriptionId: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerId: sub.customerId,
      customerName: customer ? (customer.name || customer.companyName) : 'Valued Customer',
      customerEmail: customer?.email,
      invoiceDate: targetDateStr,
      dueDate,
      billingPeriodStart,
      billingPeriodEnd,
      status: 'confirmed', // Draft -> Confirmed -> Paid
      lines: invoiceLines,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal,
      discountAppliedNote,
      taxRate,
      taxTotal,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      notes: `Automated recurring billing for ${plan?.name || 'Subscription'} (${billingPeriodStart} to ${billingPeriodEnd})`
    });

    // Update Subscription next billing date
    db.update('subscriptions', sub.id, {
      nextBillingDate,
      lastBilledDate: targetDateStr,
      lastInvoiceId: newInvoice.id
    });

    generatedInvoices.push(newInvoice);
  }

  db.logAudit('RUN_BILLING_ENGINE', 'System Scheduler', {
    targetDate: targetDateStr,
    generatedInvoicesCount: generatedInvoices.length,
    skippedCount: skippedSubscriptions.length,
    closedCount: closedSubscriptions.length
  });

  return {
    success: true,
    targetDate: targetDateStr,
    generatedInvoices,
    skippedSubscriptions,
    closedSubscriptions
  };
}

module.exports = {
  runBillingEngine,
  calculateDueDate,
  advanceBillingDate,
  evaluateDiscount
};
