const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  console.log('Seeding Brightloop Subscription Management System...');

  // Reset collections
  db.data = {
    users: [],
    products: [],
    plans: [],
    quotationTemplates: [],
    subscriptions: [],
    discountRules: [],
    taxRules: [],
    invoices: [],
    payments: [],
    auditLogs: []
  };

  // Password compliant with hackathon requirement: >8 chars, uppercase, lowercase, special character
  const adminPasswordHash = bcrypt.hashSync('Admin@2026!', 10);
  const staffPasswordHash = bcrypt.hashSync('Staff@2026!', 10);
  const clientPasswordHash = bcrypt.hashSync('Client@2026!', 10);

  // 1. Users & RBAC
  const adminUser = db.create('users', {
    name: 'Alexandra Vance',
    email: 'admin@brightloop.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    companyName: 'Brightloop Software HQ',
    phone: '+1 (555) 019-2831'
  });

  const staffUser = db.create('users', {
    name: 'Sarah Jenkins',
    email: 'sarah.sales@brightloop.com',
    passwordHash: staffPasswordHash,
    role: 'staff',
    companyName: 'Brightloop Sales & Support',
    phone: '+1 (555) 014-9922'
  });

  const customer1 = db.create('users', {
    name: 'John Miller',
    email: 'john@smallshop.com',
    passwordHash: clientPasswordHash,
    role: 'customer',
    companyName: 'Miller Artisanal Bakery',
    phone: '+1 (555) 301-8844'
  });

  const customer2 = db.create('users', {
    name: 'Elena Rostova',
    email: 'finance@acmecorp.com',
    passwordHash: clientPasswordHash,
    role: 'customer',
    companyName: 'Acme Global Logistics',
    phone: '+1 (555) 892-1100'
  });

  const customer3 = db.create('users', {
    name: 'David Kim',
    email: 'tech@innovatelabs.io',
    passwordHash: clientPasswordHash,
    role: 'customer',
    companyName: 'Innovate Labs Inc',
    phone: '+1 (555) 441-2901'
  });

  // 2. Products & Variants (including Odoo brand +$560 requirement)
  const product1 = db.create('products', {
    name: 'BrightERP Business Suite',
    type: 'software',
    salesPrice: 1200,
    costPrice: 420,
    notes: 'Complete ERP suite covering finances, inventory, CRM, and recurring billing.',
    variants: [
      {
        attribute: 'Brand Edition',
        options: [
          { name: 'Standard Edition', priceDelta: 0 },
          { name: 'Odoo Powered Edition', priceDelta: 560 }, // As specified in problem statement
          { name: 'Enterprise Cloud Edition', priceDelta: 950 }
        ]
      },
      {
        attribute: 'Deployment Tier',
        options: [
          { name: 'Shared Cloud', priceDelta: 0 },
          { name: 'Dedicated High-Availability Node', priceDelta: 250 }
        ]
      }
    ],
    isAvailable: true
  });

  const product2 = db.create('products', {
    name: 'BrightCRM Pro',
    type: 'software',
    salesPrice: 450,
    costPrice: 130,
    notes: 'Lead tracking, pipeline automation, omnichannel client communication.',
    variants: [
      {
        attribute: 'Seat Capacity',
        options: [
          { name: 'Up to 5 Seats', priceDelta: 0 },
          { name: 'Up to 25 Seats', priceDelta: 300 },
          { name: 'Unlimited Seats', priceDelta: 750 }
        ]
      }
    ],
    isAvailable: true
  });

  const product3 = db.create('products', {
    name: 'Multi-Company Consolidation Add-on',
    type: 'addon',
    salesPrice: 180,
    costPrice: 45,
    notes: 'Consolidate multiple company ledgers and currency accounts effortlessly.',
    variants: [],
    isAvailable: true
  });

  const product4 = db.create('products', {
    name: 'Automated Bank Feeds & Reconcile',
    type: 'addon',
    salesPrice: 95,
    costPrice: 20,
    notes: 'Direct API feed with 14,000+ banks worldwide with automated rules.',
    variants: [],
    isAvailable: true
  });

  const product5 = db.create('products', {
    name: 'Dedicated 24/7 Priority SLA',
    type: 'service',
    salesPrice: 350,
    costPrice: 70,
    notes: '15-minute response SLA with dedicated account technical manager.',
    variants: [],
    isAvailable: true
  });

  // 3. Plans
  const planMonthly = db.create('plans', {
    name: 'Growth Monthly Plan',
    code: 'PLAN-MTH-GROWTH',
    description: 'Billed monthly. Ideal for nimble small-to-medium businesses scaling operations.',
    cost: 299,
    billingCycle: 'monthly',
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    autoCloseOnEnd: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    isActive: true
  });

  const planYearly = db.create('plans', {
    name: 'Enterprise Annual Contract',
    code: 'PLAN-YR-ENTERPRISE',
    description: 'Billed annually with dedicated enterprise SLAs and maximum stability.',
    cost: 2990,
    billingCycle: 'yearly',
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    autoCloseOnEnd: false,
    canCloseEarly: false,
    canPause: true,
    canRenew: true,
    isActive: true
  });

  const planWeekly = db.create('plans', {
    name: 'Weekly Sprint Flex',
    code: 'PLAN-WK-FLEX',
    description: 'Flexible week-by-week compute & seat billing for short project teams.',
    cost: 85,
    billingCycle: 'weekly',
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    autoCloseOnEnd: true,
    canCloseEarly: true,
    canPause: false,
    canRenew: true,
    isActive: true
  });

  const planDaily = db.create('plans', {
    name: 'Daily Dedicated Burst',
    code: 'PLAN-DAY-BURST',
    description: 'Daily resource billing for seasonal flash campaigns or high load cycles.',
    cost: 35,
    billingCycle: 'daily',
    minQuantity: 2,
    startDate: '2026-01-01',
    endDate: '2027-06-30',
    autoCloseOnEnd: true,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    isActive: true
  });

  // 4. Tax Rules
  const taxStandard = db.create('taxRules', {
    name: 'Standard VAT / Sales Tax',
    rate: 10.0,
    type: 'percentage',
    isDefault: true,
    description: 'Standard 10% value added tax'
  });

  const taxGST = db.create('taxRules', {
    name: 'Technology Services GST',
    rate: 18.0,
    type: 'percentage',
    isDefault: false,
    description: '18% GST for digital SaaS and enterprise consulting'
  });

  const taxZero = db.create('taxRules', {
    name: 'Export / Tax Exempt',
    rate: 0.0,
    type: 'percentage',
    isDefault: false,
    description: 'Zero rate for international tax-exempt entities'
  });

  // 5. Discount Rules (Admin controlled)
  const disc20 = db.create('discountRules', {
    code: 'BRIGHT20',
    name: 'Annual Scale 20% Discount',
    type: 'percentage',
    value: 20,
    minPurchaseAmount: 1000,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    usageLimit: 200,
    timesUsed: 14,
    appliesToScope: 'subscription',
    isActive: true
  });

  const discFixed50 = db.create('discountRules', {
    code: 'SEAT50',
    name: 'High Seat Volume $50 Credit',
    type: 'fixed',
    value: 50,
    minPurchaseAmount: 200,
    minQuantity: 3,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    usageLimit: 50,
    timesUsed: 6,
    appliesToScope: 'subscription',
    isActive: true
  });

  const discOdooProduct = db.create('discountRules', {
    code: 'ODOOPROMO',
    name: '$100 Off BrightERP Core',
    type: 'fixed',
    value: 100,
    minPurchaseAmount: 500,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    usageLimit: 50,
    timesUsed: 2,
    appliesToScope: 'specific_product',
    productIds: [product1.id],
    isActive: true
  });

  const discExpired = db.create('discountRules', {
    code: 'EXPIRED15',
    name: 'Expired Beta Discount',
    type: 'percentage',
    value: 15,
    minPurchaseAmount: 100,
    minQuantity: 1,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    usageLimit: 10,
    timesUsed: 10,
    appliesToScope: 'subscription',
    isActive: false
  });

  // 6. Quotation Templates
  const quoteTemplate1 = db.create('quotationTemplates', {
    name: 'SME Quickstart Bundle',
    validityDays: 15,
    planId: planMonthly.id,
    notes: 'Complete turnkey starter bundle for growth-oriented retail and service businesses.',
    lines: [
      {
        productId: product1.id,
        productName: product1.name,
        variant: 'Standard Edition',
        variantPriceDelta: 0,
        quantity: 1,
        unitPrice: 1200
      },
      {
        productId: product4.id,
        productName: product4.name,
        variant: null,
        variantPriceDelta: 0,
        quantity: 1,
        unitPrice: 95
      }
    ]
  });

  const quoteTemplate2 = db.create('quotationTemplates', {
    name: 'Odoo Enterprise Multi-Company Suite',
    validityDays: 30,
    planId: planYearly.id,
    notes: 'Premium package featuring Odoo-powered edition with multi-company consolidation and 24/7 SLA.',
    lines: [
      {
        productId: product1.id,
        productName: product1.name,
        variant: 'Odoo Powered Edition',
        variantPriceDelta: 560,
        quantity: 2,
        unitPrice: 1760 // 1200 + 560
      },
      {
        productId: product3.id,
        productName: product3.name,
        variant: null,
        variantPriceDelta: 0,
        quantity: 1,
        unitPrice: 180
      },
      {
        productId: product5.id,
        productName: product5.name,
        variant: null,
        variantPriceDelta: 0,
        quantity: 1,
        unitPrice: 350
      }
    ]
  });

  // 7. Subscriptions across different lifecycle stages
  // SUB-0001: Active (Due today for billing run test!)
  const sub1 = db.create('subscriptions', {
    subscriptionNumber: 'SUB-2026-0001',
    customerId: customer1.id,
    customerName: customer1.companyName,
    customerEmail: customer1.email,
    planId: planMonthly.id,
    planName: planMonthly.name,
    status: 'active',
    startDate: '2026-09-01',
    expiryDate: '2027-09-01',
    nextBillingDate: '2026-10-01', // Due!
    paymentTerms: 'immediate',
    autoCloseOnEnd: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    taxRate: 10,
    discountRuleId: discFixed50.id,
    lines: [
      {
        id: 'line-1',
        productId: product1.id,
        productName: product1.name,
        variant: 'Odoo Powered Edition',
        variantPriceDelta: 560,
        quantity: 3,
        unitPrice: 1760,
        amount: 5280
      },
      {
        id: 'line-2',
        productId: product4.id,
        productName: product4.name,
        variant: null,
        variantPriceDelta: 0,
        quantity: 1,
        unitPrice: 95,
        amount: 95
      }
    ],
    notes: 'Primary monthly subscription for Miller Artisanal Bakery'
  });

  // SUB-0002: Active Enterprise contract
  const sub2 = db.create('subscriptions', {
    subscriptionNumber: 'SUB-2026-0002',
    customerId: customer2.id,
    customerName: customer2.companyName,
    customerEmail: customer2.email,
    planId: planYearly.id,
    planName: planYearly.name,
    status: 'active',
    startDate: '2026-03-15',
    expiryDate: '2027-03-15',
    nextBillingDate: '2026-11-15',
    paymentTerms: '30_days',
    autoCloseOnEnd: false,
    canCloseEarly: false,
    canPause: true,
    canRenew: true,
    taxRate: 10,
    discountRuleId: disc20.id,
    lines: [
      {
        id: 'line-3',
        productId: product1.id,
        productName: product1.name,
        variant: 'Odoo Powered Edition',
        variantPriceDelta: 560,
        quantity: 5,
        unitPrice: 1760,
        amount: 8800
      },
      {
        id: 'line-4',
        productId: product3.id,
        productName: product3.name,
        variant: null,
        variantPriceDelta: 0,
        quantity: 2,
        unitPrice: 180,
        amount: 360
      },
      {
        id: 'line-5',
        productId: product5.id,
        productName: product5.name,
        variant: null,
        variantPriceDelta: 0,
        quantity: 1,
        unitPrice: 350,
        amount: 350
      }
    ],
    notes: 'Annual multi-branch logistics ERP'
  });

  // SUB-0003: Quotation stage
  const sub3 = db.create('subscriptions', {
    subscriptionNumber: 'SUB-2026-0003',
    customerId: customer3.id,
    customerName: customer3.companyName,
    customerEmail: customer3.email,
    planId: planMonthly.id,
    planName: planMonthly.name,
    status: 'quotation',
    quotationTemplateId: quoteTemplate1.id,
    startDate: '2026-11-01',
    expiryDate: '2027-11-01',
    validUntil: '2026-11-15',
    paymentTerms: '15_days',
    autoCloseOnEnd: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    taxRate: 10,
    lines: [
      {
        id: 'line-6',
        productId: product2.id,
        productName: product2.name,
        variant: 'Up to 25 Seats',
        variantPriceDelta: 300,
        quantity: 2,
        unitPrice: 750,
        amount: 1500
      }
    ],
    notes: 'Pending quotation review by Innovate Labs tech lead'
  });

  // SUB-0004: Draft stage
  const sub4 = db.create('subscriptions', {
    subscriptionNumber: 'SUB-2026-0004',
    customerId: customer1.id,
    customerName: customer1.companyName,
    customerEmail: customer1.email,
    planId: planWeekly.id,
    planName: planWeekly.name,
    status: 'draft',
    startDate: '2026-11-10',
    expiryDate: '2027-02-10',
    paymentTerms: 'immediate',
    autoCloseOnEnd: true,
    canCloseEarly: true,
    canPause: false,
    canRenew: true,
    taxRate: 10,
    lines: [
      {
        id: 'line-7',
        productId: product4.id,
        productName: product4.name,
        variant: null,
        quantity: 1,
        unitPrice: 95,
        amount: 95
      }
    ],
    notes: 'Draft quote being drafted by sales staff'
  });

  // SUB-0005: Paused stage
  const sub5 = db.create('subscriptions', {
    subscriptionNumber: 'SUB-2026-0005',
    customerId: customer3.id,
    customerName: customer3.companyName,
    customerEmail: customer3.email,
    planId: planMonthly.id,
    planName: planMonthly.name,
    status: 'paused',
    startDate: '2026-05-01',
    expiryDate: '2027-05-01',
    paymentTerms: 'immediate',
    autoCloseOnEnd: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    taxRate: 10,
    lines: [
      {
        id: 'line-8',
        productId: product2.id,
        productName: product2.name,
        variant: 'Up to 5 Seats',
        quantity: 1,
        unitPrice: 450,
        amount: 450
      }
    ],
    notes: 'Paused by customer during quarterly server migration'
  });

  // 8. Invoices & Historical Payments
  // INV-0001: Paid Invoice
  const inv1 = db.create('invoices', {
    invoiceNumber: 'INV-2026-0001',
    subscriptionId: sub1.id,
    subscriptionNumber: sub1.subscriptionNumber,
    customerId: customer1.id,
    customerName: customer1.companyName,
    customerEmail: customer1.email,
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-01',
    billingPeriodStart: '2026-09-01',
    billingPeriodEnd: '2026-10-01',
    status: 'paid',
    lines: sub1.lines,
    subtotal: 5375,
    discountTotal: 50,
    discountAppliedNote: 'High Seat Volume $50 Credit (SEAT50): -$50',
    taxRate: 10,
    taxTotal: 532.5,
    totalAmount: 5857.5,
    paidAmount: 5857.5,
    balanceDue: 0,
    notes: 'Initial activation billing for Miller Artisanal Bakery'
  });

  db.create('payments', {
    paymentNumber: 'PAY-2026-0001',
    invoiceId: inv1.id,
    invoiceNumber: inv1.invoiceNumber,
    customerId: customer1.id,
    customerName: customer1.companyName,
    amount: 5857.5,
    paymentDate: '2026-09-02',
    paymentMethod: 'credit_card',
    referenceNote: 'Stripe charge ch_3M9qLk2eZvKYlo2C0192',
    notes: 'Paid in full via online checkout'
  });

  // INV-0002: Confirmed Invoice (Outstanding / Overdue demo)
  const inv2 = db.create('invoices', {
    invoiceNumber: 'INV-2026-0002',
    subscriptionId: sub2.id,
    subscriptionNumber: sub2.subscriptionNumber,
    customerId: customer2.id,
    customerName: customer2.companyName,
    customerEmail: customer2.email,
    invoiceDate: '2026-09-15',
    dueDate: '2026-10-15', // Overdue!
    billingPeriodStart: '2026-09-15',
    billingPeriodEnd: '2026-10-15',
    status: 'confirmed',
    lines: sub2.lines,
    subtotal: 9510,
    discountTotal: 1902, // 20%
    discountAppliedNote: 'Annual Scale 20% Discount (BRIGHT20): -$1902',
    taxRate: 10,
    taxTotal: 760.8,
    totalAmount: 8368.8,
    paidAmount: 3000,
    balanceDue: 5368.8,
    notes: 'Enterprise contract mid-cycle partial payment'
  });

  db.create('payments', {
    paymentNumber: 'PAY-2026-0002',
    invoiceId: inv2.id,
    invoiceNumber: inv2.invoiceNumber,
    customerId: customer2.id,
    customerName: customer2.companyName,
    amount: 3000,
    paymentDate: '2026-09-20',
    paymentMethod: 'bank_transfer',
    referenceNote: 'Wire Ref #ACME-WIRE-99218',
    notes: 'Partial advance retainer payment'
  });

  console.log('Seed completed successfully!');
  console.log(`Users: ${db.getAll('users').length}`);
  console.log(`Products: ${db.getAll('products').length}`);
  console.log(`Plans: ${db.getAll('plans').length}`);
  console.log(`Subscriptions: ${db.getAll('subscriptions').length}`);
  console.log(`Invoices: ${db.getAll('invoices').length}`);
  console.log(`Payments: ${db.getAll('payments').length}`);
}

seed().catch(console.error);
