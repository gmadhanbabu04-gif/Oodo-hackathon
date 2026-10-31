const API_BASE = '/api';

export const DEMO_USERS = {
  admin: {
    email: 'admin@brightloop.com',
    name: 'Alexandra Vance',
    role: 'admin',
    companyName: 'Brightloop Software HQ',
    badge: 'Admin (Full Control)'
  },
  staff: {
    email: 'sarah.sales@brightloop.com',
    name: 'Sarah Jenkins',
    role: 'staff',
    companyName: 'Brightloop Sales & Support',
    badge: 'Staff (Operations)'
  },
  customer: {
    email: 'john@smallshop.com',
    name: 'John Miller',
    role: 'customer',
    companyName: 'Miller Artisanal Bakery',
    badge: 'Customer (Portal Only)'
  }
};

let currentToken = localStorage.getItem('brightloop_token') || null;
let currentDemoRole = localStorage.getItem('brightloop_demo_role') || 'admin';
let currentUser = JSON.parse(localStorage.getItem('brightloop_user') || 'null') || DEMO_USERS.admin;

export function getActiveUser() {
  return currentUser;
}

export function setActiveUser(user, token = null) {
  currentUser = user;
  currentToken = token;
  if (token) {
    localStorage.setItem('brightloop_token', token);
  } else {
    localStorage.removeItem('brightloop_token');
  }
  localStorage.setItem('brightloop_user', JSON.stringify(user));
  if (user && user.role) {
    localStorage.setItem('brightloop_demo_role', user.role);
    currentDemoRole = user.role;
  }
}

export function switchDemoRole(role) {
  const user = DEMO_USERS[role];
  if (user) {
    setActiveUser(user, null);
  }
  return user;
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
    ...(currentDemoRole ? { 'x-demo-role': currentDemoRole } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      setActiveUser(res.user, res.token);
    }
    return res;
  },
  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) {
      setActiveUser(res.user, res.token);
    }
    return res;
  },
  forgotPassword: (email) => request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  resetPassword: (email, token, newPassword) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword })
  }),
  createStaff: (staffData) => request('/users/staff', {
    method: 'POST',
    body: JSON.stringify(staffData)
  }),
  getUsers: (role) => request(`/users${role ? `?role=${role}` : ''}`),

  // Customers (SubscriptIQ Core CRM)
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers${query ? `?${query}` : ''}`);
  },
  createCustomer: (customer) => request('/customers', {
    method: 'POST',
    body: JSON.stringify(customer)
  }),
  updateCustomer: (id, updates) => request(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  archiveCustomer: (id) => request(`/customers/${id}`, {
    method: 'DELETE'
  }),

  // Products
  getProducts: () => request('/products'),
  createProduct: (p) => request('/products', { method: 'POST', body: JSON.stringify(p) }),
  updateProduct: (id, p) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Plans & Templates
  getPlans: () => request('/plans'),
  createPlan: (plan) => request('/plans', { method: 'POST', body: JSON.stringify(plan) }),
  updatePlan: (id, plan) => request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(plan) }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
  getQuotationTemplates: () => request('/quotation-templates'),
  createQuotationTemplate: (t) => request('/quotation-templates', { method: 'POST', body: JSON.stringify(t) }),

  // Subscriptions & Quotation pipeline
  getSubscriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/subscriptions${query ? `?${query}` : ''}`);
  },
  getSubscription: (id) => request(`/subscriptions/${id}`),
  createSubscription: (sub) => request('/subscriptions', { method: 'POST', body: JSON.stringify(sub) }),
  updateSubscriptionStatus: (id, newStatus, notes) => request(`/subscriptions/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ newStatus, notes })
  }),
  togglePauseSubscription: (id) => request(`/subscriptions/${id}/pause-resume`, { method: 'POST' }),
  closeEarlySubscription: (id) => request(`/subscriptions/${id}/close-early`, { method: 'POST' }),
  checkoutSubscription: (checkoutData) => request('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutData)
  }),

  // Billing & Invoices
  runBilling: (targetDate) => request('/billing/run', {
    method: 'POST',
    body: JSON.stringify({ targetDate })
  }),
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/invoices${query ? `?${query}` : ''}`);
  },
  getInvoice: (id) => request(`/invoices/${id}`),
  updateInvoiceStatus: (id, status) => request(`/invoices/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  }),
  sendInvoiceEmail: (id) => request(`/invoices/${id}/send`, { method: 'POST' }),

  // Payments
  getPayments: () => request('/payments'),
  recordPayment: (paymentData) => request('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),

  // Discounts & Taxes
  getDiscounts: () => request('/discounts'),
  createDiscount: (d) => request('/discounts', { method: 'POST', body: JSON.stringify(d) }),
  deleteDiscount: (id) => request(`/discounts/${id}`, { method: 'DELETE' }),
  getTaxes: () => request('/taxes'),
  createTax: (t) => request('/taxes', { method: 'POST', body: JSON.stringify(t) }),

  // Analytics
  getAnalyticsSummary: () => request('/analytics/summary'),
  getIntelligence: () => request('/analytics/intelligence')
};
