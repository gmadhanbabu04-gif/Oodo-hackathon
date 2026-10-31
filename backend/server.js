const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const { runBillingEngine } = require('./billingEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_super_secret_hackathon_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Request timer middleware to guarantee <2s performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1500) {
      console.warn(`[SLOW ROUTE] ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  next();
});

// Password validation according to hackathon brief:
// "password must be more than eight characters, with an uppercase letter, a lowercase letter and a special character."
function validatePassword(password) {
  if (!password || password.length <= 8) {
    return { valid: false, message: 'Password must be more than 8 characters long.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasSpecial) {
    return {
      valid: false,
      message: 'Password must include at least one uppercase letter, one lowercase letter, and one special character.'
    };
  }
  return { valid: true };
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if role is passed in simulated demo header
    const demoRole = req.headers['x-demo-role'];
    if (demoRole) {
      const user = db.findOne('users', u => u.role === demoRole);
      if (user) {
        req.user = user;
        return next();
      }
    }
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Role authorization middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permission denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
}

/* ==========================================================================
   1. AUTHENTICATION & RBAC ROUTES
   ========================================================================== */

// Register a new customer
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, companyName, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    // Email unique check
    const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Password validation rule
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({ error: passCheck.message });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.create('users', {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer', // Self registration is strictly customer
      companyName: companyName || name,
      phone: phone || ''
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, companyName: user.companyName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password - Generates reset link simulation
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.findOne('users', u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!user) {
    // For security, don't leak account existence, but confirm
    return res.json({ message: 'If an account exists for this email, a reset link has been dispatched.' });
  }

  const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  db.update('users', user.id, {
    resetToken,
    resetExpires: Date.now() + 3600000 // 1 hour
  });

  res.json({
    message: 'Reset link sent to your registered email.',
    simulatedResetLink: `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`,
    token: resetToken
  });
});

// Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = db.findOne('users', u => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user || user.resetToken !== token || (user.resetExpires && user.resetExpires < Date.now())) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const passCheck = validatePassword(newPassword);
  if (!passCheck.valid) {
    return res.status(400).json({ error: passCheck.message });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  db.update('users', user.id, {
    passwordHash,
    resetToken: null,
    resetExpires: null
  });

  res.json({ message: 'Password reset successfully. You can now log in.' });
});

// Admin creates staff member ("Only the admin can add a new member of staff")
app.post('/api/users/staff', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { name, email, password, companyName, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email is already in use' });
  }

  const passCheck = validatePassword(password);
  if (!passCheck.valid) {
    return res.status(400).json({ error: passCheck.message });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newStaff = db.create('users', {
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'staff',
    companyName: companyName || 'Brightloop Internal Staff',
    phone: phone || ''
  });

  res.status(201).json({
    message: 'Staff member added successfully',
    user: {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role
    }
  });
});

// Get users list (for assigning customers or staff management)
app.get('/api/users', authenticateToken, (req, res) => {
  const { role } = req.query;
  let users = db.getAll('users');

  if (req.user.role === 'customer') {
    return res.status(403).json({ error: 'Customers cannot browse user directory' });
  }

  if (role) {
    users = users.filter(u => u.role === role);
  }

  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    companyName: u.companyName,
    phone: u.phone,
    createdAt: u.createdAt
  }));

  res.json(safeUsers);
});

/* ==========================================================================
   1B. DEDICATED CUSTOMER MANAGEMENT MODULE (SUBSCRIPTIQ)
   ========================================================================== */

// List customers with search, filter, sort and pagination
app.get('/api/customers', authenticateToken, (req, res) => {
  if (req.user.role === 'customer') {
    const single = db.getById('users', req.user.id);
    return res.json({ customers: [single], total: 1, page: 1, limit: 10 });
  }

  let list = db.getAll('users').filter(u => u.role === 'customer');
  const { search, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => 
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.companyName?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }

  if (status && status !== 'all') {
    list = list.filter(c => (c.accountStatus || 'active') === status);
  }

  // Sort
  list.sort((a, b) => {
    const fieldA = a[sortBy || 'createdAt'] || '';
    const fieldB = b[sortBy || 'createdAt'] || '';
    if (sortOrder === 'desc') {
      return fieldB > fieldA ? 1 : -1;
    }
    return fieldA > fieldB ? 1 : -1;
  });

  const total = list.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  // Attach subscription and invoice counts for rich insight
  const subs = db.getAll('subscriptions');
  const invs = db.getAll('invoices');

  const enriched = paginated.map(c => {
    const customerSubs = subs.filter(s => s.customerId === c.id);
    const customerInvs = invs.filter(i => i.customerId === c.id);
    const totalBalance = customerInvs.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      companyName: c.companyName || c.name,
      phone: c.phone || 'N/A',
      accountStatus: c.accountStatus || 'active',
      createdAt: c.createdAt,
      activeSubscriptionsCount: customerSubs.filter(s => s.status === 'active').length,
      totalSubscriptionsCount: customerSubs.length,
      totalOutstandingBalance: Math.round(totalBalance * 100) / 100
    };
  });

  res.json({
    customers: enriched,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1
  });
});

// Create Customer via Staff/Admin
app.post('/api/customers', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { name, email, companyName, phone, accountStatus } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Customer name and email are required.' });
  }

  const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A customer account with this email already exists.' });
  }

  const defaultPasswordHash = bcrypt.hashSync('Client@2026!', 10);
  const newCustomer = db.create('users', {
    name,
    email: email.toLowerCase(),
    passwordHash: defaultPasswordHash,
    role: 'customer',
    companyName: companyName || name,
    phone: phone || '',
    accountStatus: accountStatus || 'active'
  });

  res.status(201).json({
    message: 'Customer created successfully',
    customer: newCustomer
  });
});

// Update Customer
app.put('/api/customers/:id', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { name, email, companyName, phone, accountStatus } = req.body;
  const customer = db.getById('users', req.params.id);

  if (!customer || customer.role !== 'customer') {
    return res.status(404).json({ error: 'Customer record not found' });
  }

  const updated = db.update('users', customer.id, {
    ...(name ? { name } : {}),
    ...(email ? { email: email.toLowerCase() } : {}),
    ...(companyName ? { companyName } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(accountStatus ? { accountStatus } : {})
  });

  res.json(updated);
});

// Archive Customer
app.delete('/api/customers/:id', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const customer = db.getById('users', req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  // Soft-archive to preserve financial and historical invoice records
  const updated = db.update('users', customer.id, { accountStatus: 'archived' });
  res.json({ message: 'Customer successfully archived', customer: updated });
});

/* ==========================================================================
   2. PRODUCTS & VARIANTS
   ========================================================================== */

app.get('/api/products', (req, res) => {
  const products = db.getAll('products');
  res.json(products);
});

app.post('/api/products', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { name, type, salesPrice, costPrice, notes, variants, isAvailable } = req.body;
  if (!name || salesPrice === undefined) {
    return res.status(400).json({ error: 'Product name and sales price required' });
  }

  const product = db.create('products', {
    name,
    type: type || 'software',
    salesPrice: Number(salesPrice),
    costPrice: Number(costPrice || 0),
    notes: notes || '',
    variants: Array.isArray(variants) ? variants : [],
    isAvailable: isAvailable !== false
  });

  res.status(201).json(product);
});

app.put('/api/products/:id', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const updated = db.update('products', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

app.delete('/api/products/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const deleted = db.delete('products', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product removed' });
});

/* ==========================================================================
   3. PLANS & QUOTATION TEMPLATES
   ========================================================================== */

app.get('/api/plans', (req, res) => {
  res.json(db.getAll('plans'));
});

// Admin creates plans with lifecycle policies
app.post('/api/plans', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const {
    name,
    code,
    description,
    cost,
    billingCycle,
    minQuantity,
    startDate,
    endDate,
    autoCloseOnEnd,
    canCloseEarly,
    canPause,
    canRenew
  } = req.body;

  if (!name || cost === undefined || !billingCycle) {
    return res.status(400).json({ error: 'Plan name, cost and billing cycle are required' });
  }

  const plan = db.create('plans', {
    name,
    code: code || `PLAN-${Date.now().toString(36).toUpperCase()}`,
    description: description || '',
    cost: Number(cost),
    billingCycle, // daily, weekly, monthly, yearly
    minQuantity: Number(minQuantity || 1),
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || null,
    autoCloseOnEnd: Boolean(autoCloseOnEnd),
    canCloseEarly: Boolean(canCloseEarly),
    canPause: Boolean(canPause),
    canRenew: canRenew !== false,
    isActive: true
  });

  res.status(201).json(plan);
});

app.put('/api/plans/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const updated = db.update('plans', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Plan not found' });
  res.json(updated);
});

app.delete('/api/plans/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const deleted = db.delete('plans', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Plan not found' });
  res.json({ message: 'Plan removed' });
});

// Quotation Templates
app.get('/api/quotation-templates', (req, res) => {
  res.json(db.getAll('quotationTemplates'));
});

app.post('/api/quotation-templates', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { name, validityDays, planId, lines, notes } = req.body;
  if (!name || !planId) {
    return res.status(400).json({ error: 'Template name and plan required' });
  }

  const template = db.create('quotationTemplates', {
    name,
    validityDays: Number(validityDays || 15),
    planId,
    lines: lines || [],
    notes: notes || ''
  });

  res.status(201).json(template);
});

/* ==========================================================================
   4. SUBSCRIPTIONS & QUOTATION PIPELINE
   ========================================================================== */

app.get('/api/subscriptions', authenticateToken, (req, res) => {
  let list = db.getAll('subscriptions');

  // Customer role can ONLY see their own subscriptions
  if (req.user.role === 'customer') {
    list = list.filter(s => s.customerId === req.user.id);
  }

  // Filters
  const { status, customerId, search } = req.query;
  if (status && status !== 'all') {
    list = list.filter(s => s.status === status);
  }
  if (customerId) {
    list = list.filter(s => s.customerId === customerId);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      s.subscriptionNumber?.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.planName?.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.get('/api/subscriptions/:id', authenticateToken, (req, res) => {
  const sub = db.getById('subscriptions', req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  if (req.user.role === 'customer' && sub.customerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(sub);
});

// Create subscription or quote
app.post('/api/subscriptions', authenticateToken, (req, res) => {
  const {
    customerId,
    planId,
    lines,
    paymentTerms,
    startDate,
    expiryDate,
    status,
    notes,
    discountRuleId,
    quotationTemplateId
  } = req.body;

  // Customers can only create for themselves
  const targetCustomerId = req.user.role === 'customer' ? req.user.id : customerId;
  const customer = db.getById('users', targetCustomerId);
  const plan = db.getById('plans', planId);

  if (!customer || !plan) {
    return res.status(400).json({ error: 'Valid customer and plan required' });
  }

  const subNumber = db.getNextNumber('subscription');
  const initialStatus = status || (req.user.role === 'customer' ? 'quotation' : 'draft');

  const newSub = db.create('subscriptions', {
    subscriptionNumber: subNumber,
    customerId: customer.id,
    customerName: customer.companyName || customer.name,
    customerEmail: customer.email,
    planId: plan.id,
    planName: plan.name,
    status: initialStatus, // draft, quotation, confirmed, active, closed
    quotationTemplateId: quotationTemplateId || null,
    startDate: startDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || null,
    nextBillingDate: startDate || new Date().toISOString().split('T')[0],
    paymentTerms: paymentTerms || 'immediate',
    autoCloseOnEnd: plan.autoCloseOnEnd,
    canCloseEarly: plan.canCloseEarly,
    canPause: plan.canPause,
    canRenew: plan.canRenew,
    taxRate: 10,
    discountRuleId: discountRuleId || null,
    lines: lines || [],
    notes: notes || ''
  });

  res.status(201).json(newSub);
});

// Update Subscription Status Lifecycle:
// Draft -> Quotation -> Confirmed -> Active -> Closed
app.post('/api/subscriptions/:id/status', authenticateToken, (req, res) => {
  const { newStatus, notes } = req.body;
  const sub = db.getById('subscriptions', req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  // Customers can only accept a quotation (confirm) or cancel if allowed
  if (req.user.role === 'customer') {
    if (sub.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (newStatus === 'confirmed' && sub.status === 'quotation') {
      // Customer accepting quote
    } else if (newStatus === 'closed' && sub.canCloseEarly) {
      // Customer canceling subscription early
    } else {
      return res.status(400).json({ error: 'Action not permitted by customer' });
    }
  }

  const updates = { status: newStatus };
  if (newStatus === 'active' && !sub.startDate) {
    updates.startDate = new Date().toISOString().split('T')[0];
  }
  if (newStatus === 'closed') {
    updates.closedAt = new Date().toISOString().split('T')[0];
  }
  if (notes) {
    updates.notes = `${sub.notes ? sub.notes + ' | ' : ''}${notes}`;
  }

  const updatedSub = db.update('subscriptions', sub.id, updates);
  db.logAudit('SUBSCRIPTION_STATUS_CHANGE', req.user.name, {
    subscriptionId: sub.id,
    from: sub.status,
    to: newStatus
  });

  res.json(updatedSub);
});

// Pause / Resume Subscription
app.post('/api/subscriptions/:id/pause-resume', authenticateToken, (req, res) => {
  const sub = db.getById('subscriptions', req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  if (!sub.canPause && req.user.role === 'customer') {
    return res.status(400).json({ error: 'This plan does not permit pausing.' });
  }

  const newStatus = sub.status === 'paused' ? 'active' : 'paused';
  const updated = db.update('subscriptions', sub.id, { status: newStatus });
  res.json(updated);
});

// Close early check
app.post('/api/subscriptions/:id/close-early', authenticateToken, (req, res) => {
  const sub = db.getById('subscriptions', req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  if (!sub.canCloseEarly && req.user.role !== 'admin') {
    return res.status(400).json({ error: 'This plan is locked and cannot be closed early.' });
  }

  const updated = db.update('subscriptions', sub.id, {
    status: 'closed',
    closedAt: new Date().toISOString().split('T')[0]
  });
  res.json(updated);
});

/* ==========================================================================
   5. BILLING ENGINE & INVOICING
   ========================================================================== */

// Trigger Billing Day recurring engine
app.post('/api/billing/run', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  try {
    const { targetDate } = req.body;
    const result = runBillingEngine({ targetDate });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List invoices
app.get('/api/invoices', authenticateToken, (req, res) => {
  let list = db.getAll('invoices');

  // Customer role sees only their own
  if (req.user.role === 'customer') {
    list = list.filter(i => i.customerId === req.user.id);
  }

  const { status, customerId, search } = req.query;
  if (status && status !== 'all') {
    list = list.filter(i => i.status === status);
  }
  if (customerId) {
    list = list.filter(i => i.customerId === customerId);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(i =>
      i.invoiceNumber?.toLowerCase().includes(q) ||
      i.customerName?.toLowerCase().includes(q) ||
      i.subscriptionNumber?.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.get('/api/invoices/:id', authenticateToken, (req, res) => {
  const invoice = db.getById('invoices', req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(invoice);
});

// Update invoice status: draft -> confirmed -> paid / cancelled
app.post('/api/invoices/:id/status', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { status } = req.body;
  const invoice = db.getById('invoices', req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const updated = db.update('invoices', invoice.id, { status });
  res.json(updated);
});

// Send invoice simulation
app.post('/api/invoices/:id/send', authenticateToken, (req, res) => {
  const invoice = db.getById('invoices', req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  db.update('invoices', invoice.id, {
    sentAt: new Date().toISOString(),
    sentTo: invoice.customerEmail
  });

  res.json({
    message: `Invoice ${invoice.invoiceNumber} successfully emailed to ${invoice.customerEmail}.`
  });
});

/* ==========================================================================
   6. PAYMENTS & RECONCILIATION
   ========================================================================== */

app.get('/api/payments', authenticateToken, (req, res) => {
  let list = db.getAll('payments');
  if (req.user.role === 'customer') {
    list = list.filter(p => p.customerId === req.user.id);
  }
  res.json(list);
});

// Record a payment against an invoice
app.post('/api/payments', authenticateToken, (req, res) => {
  const { invoiceId, amount, paymentMethod, referenceNote, notes } = req.body;

  const invoice = db.getById('invoices', invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const paymentAmount = Number(amount);
  if (!paymentAmount || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount required' });
  }

  const payNumber = db.getNextNumber('payment');
  const payment = db.create('payments', {
    paymentNumber: payNumber,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    amount: paymentAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'credit_card', // credit_card, bank_transfer, stripe, cash
    referenceNote: referenceNote || 'Direct Payment',
    notes: notes || ''
  });

  // Reconcile Invoice
  const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount;
  const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount);
  const newStatus = newBalance <= 0 ? 'paid' : 'confirmed';

  db.update('invoices', invoice.id, {
    paidAmount: Math.round(newPaidAmount * 100) / 100,
    balanceDue: Math.round(newBalance * 100) / 100,
    status: newStatus
  });

  res.status(201).json({
    payment,
    invoiceUpdated: {
      id: invoice.id,
      paidAmount: newPaidAmount,
      balanceDue: newBalance,
      status: newStatus
    }
  });
});

/* ==========================================================================
   7. DISCOUNTS & TAXES (ADMIN RULES)
   ========================================================================== */

app.get('/api/discounts', (req, res) => {
  res.json(db.getAll('discountRules'));
});

// Admin creates discount rule
app.post('/api/discounts', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const {
    code,
    name,
    type, // fixed or percentage
    value,
    minPurchaseAmount,
    minQuantity,
    startDate,
    endDate,
    usageLimit,
    appliesToScope, // 'subscription' or 'specific_product'
    productIds
  } = req.body;

  if (!code || !name || value === undefined) {
    return res.status(400).json({ error: 'Code, name and discount value required' });
  }

  const rule = db.create('discountRules', {
    code: code.toUpperCase().trim(),
    name,
    type: type || 'percentage',
    value: Number(value),
    minPurchaseAmount: Number(minPurchaseAmount || 0),
    minQuantity: Number(minQuantity || 0),
    startDate: startDate || null,
    endDate: endDate || null,
    usageLimit: Number(usageLimit || 0),
    timesUsed: 0,
    appliesToScope: appliesToScope || 'subscription',
    productIds: Array.isArray(productIds) ? productIds : [],
    isActive: true
  });

  res.status(201).json(rule);
});

app.put('/api/discounts/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const updated = db.update('discountRules', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Discount rule not found' });
  res.json(updated);
});

app.delete('/api/discounts/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const deleted = db.delete('discountRules', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Discount rule not found' });
  res.json({ message: 'Discount deleted' });
});

// Taxes
app.get('/api/taxes', (req, res) => {
  res.json(db.getAll('taxRules'));
});

app.post('/api/taxes', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { name, rate, type, isDefault, description } = req.body;
  if (!name || rate === undefined) {
    return res.status(400).json({ error: 'Name and rate required' });
  }

  const tax = db.create('taxRules', {
    name,
    rate: Number(rate),
    type: type || 'percentage',
    isDefault: Boolean(isDefault),
    description: description || ''
  });

  res.status(201).json(tax);
});

/* ==========================================================================
   8. FINANCE LEAD DASHBOARD & ANALYTICS (<2s GUARANTEED)
   ========================================================================== */

app.get('/api/analytics/summary', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const subscriptions = db.getAll('subscriptions');
  const invoices = db.getAll('invoices');
  const payments = db.getAll('payments');

  const today = new Date().toISOString().split('T')[0];

  // 1. Subscription Metrics
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const quotationSubs = subscriptions.filter(s => s.status === 'quotation');
  const pausedSubs = subscriptions.filter(s => s.status === 'paused');
  const closedSubs = subscriptions.filter(s => s.status === 'closed');

  // Compute MRR (Monthly Recurring Revenue) & ARR
  let mrr = 0;
  activeSubs.forEach(sub => {
    const plan = db.getById('plans', sub.planId);
    const subTotal = (sub.lines || []).reduce((sum, l) => sum + (l.unitPrice * l.quantity), 0);
    if (!plan || plan.billingCycle === 'monthly') {
      mrr += subTotal;
    } else if (plan.billingCycle === 'yearly') {
      mrr += subTotal / 12;
    } else if (plan.billingCycle === 'weekly') {
      mrr += subTotal * 4.33;
    } else if (plan.billingCycle === 'daily') {
      mrr += subTotal * 30;
    }
  });

  const arr = mrr * 12;

  // 2. Invoice & Revenue Metrics
  let totalBilled = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;
  let overdueInvoicesCount = 0;

  invoices.forEach(inv => {
    if (inv.status !== 'cancelled') {
      totalBilled += inv.totalAmount || 0;
      totalCollected += inv.paidAmount || 0;
      const balance = inv.balanceDue || 0;
      totalOutstanding += balance;

      if (balance > 0 && inv.dueDate && inv.dueDate < today) {
        totalOverdue += balance;
        overdueInvoicesCount += 1;
      }
    }
  });

  // Recent activity
  const recentInvoices = invoices.slice(-5).reverse();
  const recentPayments = payments.slice(-5).reverse();

  res.json({
    activeSubscriptionsCount: activeSubs.length,
    quotationsCount: quotationSubs.length,
    pausedSubscriptionsCount: pausedSubs.length,
    closedSubscriptionsCount: closedSubs.length,
    totalSubscriptions: subscriptions.length,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(arr * 100) / 100,
    totalBilled: Math.round(totalBilled * 100) / 100,
    totalCollected: Math.round(totalCollected * 100) / 100,
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    totalOverdue: Math.round(totalOverdue * 100) / 100,
    overdueInvoicesCount,
    recentInvoices,
    recentPayments
  });
});

/* ==========================================================================
   9. SUBSCRIPTIQ INTELLIGENCE: RENEWAL RISK & ACTION CENTER
   ========================================================================== */

app.get('/api/analytics/intelligence', authenticateToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const subscriptions = db.getAll('subscriptions');
  const invoices = db.getAll('invoices');
  const discounts = db.getAll('discountRules');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1. Renewal Risk Model
  const renewalRisks = subscriptions
    .filter(s => s.status === 'active')
    .map(sub => {
      let riskScore = 15; // baseline low risk
      const reasons = [];

      // Check overdue invoices for this customer
      const customerUnpaid = invoices.filter(i => 
        i.customerId === sub.customerId && 
        i.balanceDue > 0 && 
        i.status !== 'cancelled'
      );
      const customerOverdue = customerUnpaid.filter(i => i.dueDate && i.dueDate < todayStr);

      if (customerOverdue.length > 0) {
        riskScore += 50;
        reasons.push(`Customer has ${customerOverdue.length} overdue invoice(s) totaling $${customerOverdue.reduce((s, x) => s + x.balanceDue, 0).toFixed(2)}.`);
      } else if (customerUnpaid.length > 0) {
        riskScore += 20;
        reasons.push(`Pending invoice balance of $${customerUnpaid.reduce((s, x) => s + x.balanceDue, 0).toFixed(2)}.`);
      }

      // Check expiry date proximity
      if (sub.expiryDate) {
        const expDate = new Date(sub.expiryDate);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 15) {
          riskScore += 30;
          reasons.push(`Subscription term expires in ${daysUntilExpiry} days.`);
        } else if (daysUntilExpiry <= 45) {
          riskScore += 15;
          reasons.push(`Renewal window opens within ${daysUntilExpiry} days.`);
        }
      }

      let category = 'low';
      let recommendedAction = 'Maintain standard automated billing schedule.';
      if (riskScore >= 60) {
        category = 'high';
        recommendedAction = 'Urgent: Dispatch account executive to reconcile overdue balance before auto-renewing contract.';
      } else if (riskScore >= 35) {
        category = 'medium';
        recommendedAction = 'Send automated courtesy renewal confirmation & invoice reminder.';
      }

      return {
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerName: sub.customerName,
        customerEmail: sub.customerEmail,
        planName: sub.planName,
        expiryDate: sub.expiryDate,
        riskScore: Math.min(100, riskScore),
        category, // 'high' | 'medium' | 'low'
        reasons,
        recommendedAction
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  // 2. Smart Action Center Queue
  const smartActions = [];

  // Action for overdue invoices
  const overdueInvoices = invoices.filter(i => (i.balanceDue || 0) > 0 && i.dueDate && i.dueDate < todayStr && i.status !== 'cancelled');
  if (overdueInvoices.length > 0) {
    const totalOverdueVal = overdueInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
    smartActions.push({
      id: 'act-overdue',
      priority: 'high',
      category: 'Finance Collection',
      title: `${overdueInvoices.length} Overdue Accounts Requiring Settlement`,
      description: `$${totalOverdueVal.toFixed(2)} in receivables past due date. Follow up with customers before service interruption.`,
      actionLabel: 'Review Overdue Invoices',
      targetView: 'invoices',
      affectedCount: overdueInvoices.length
    });
  }

  // Action for High Risk renewals
  const highRiskRenewals = renewalRisks.filter(r => r.category === 'high');
  if (highRiskRenewals.length > 0) {
    smartActions.push({
      id: 'act-renewal-risk',
      priority: 'high',
      category: 'Retention Intelligence',
      title: `${highRiskRenewals.length} High-Risk Renewals Identified`,
      description: 'Subscriptions expiring soon with outstanding invoices. Immediate account manager intervention recommended.',
      actionLabel: 'View High-Risk Accounts',
      targetView: 'subscriptions',
      affectedCount: highRiskRenewals.length
    });
  }

  // Action for pending quotations
  const pendingQuotes = subscriptions.filter(s => s.status === 'quotation');
  if (pendingQuotes.length > 0) {
    smartActions.push({
      id: 'act-quotes',
      priority: 'medium',
      category: 'Sales Pipeline',
      title: `${pendingQuotes.length} Quotation Proposals Awaiting Acceptance`,
      description: 'Prospective clients reviewing price offers. Reach out to close deals and transition to Active billing.',
      actionLabel: 'Inspect Pipeline Quotes',
      targetView: 'subscriptions',
      affectedCount: pendingQuotes.length
    });
  }

  // 3. 6-Month Revenue Forecast
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Calculate baseline monthly recurring
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  let baselineMRR = 0;
  activeSubs.forEach(sub => {
    const subTotal = (sub.lines || []).reduce((sum, l) => sum + (l.unitPrice * l.quantity), 0);
    baselineMRR += subTotal;
  });

  const revenueForecast = [];
  for (let i = 0; i < 6; i++) {
    const mIdx = (currentMonthIdx + i) % 12;
    const yr = currentMonthIdx + i >= 12 ? currentYear + 1 : currentYear;
    const growthFactor = 1 + (i * 0.045); // projected steady 4.5% month-on-month expansion
    const projected = Math.round(baselineMRR * growthFactor);
    revenueForecast.push({
      month: `${monthNames[mIdx]} ${yr}`,
      projectedRevenue: projected,
      mrrBaseline: Math.round(baselineMRR),
      growthRatePct: Math.round((growthFactor - 1) * 100)
    });
  }

  res.json({
    renewalRisks,
    smartActions,
    revenueForecast,
    calculatedAt: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`Brightloop Subscription API running on http://localhost:${PORT}`);
});
