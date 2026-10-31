# 🎥 Odoo Hackathon: Winning 5-Minute Demo Video Pitch Script
**Project**: Brightloop Software — Unified Subscription Management & Recurring Billing System  
**Presenter**: Team Leader / Developer  
**Duration**: 5 - 6 Minutes  

---

### ⏱️ Minute-by-Minute Video Recording Guide

#### [0:00 - 0:45] Introduction & The Problem at Brightloop Software
- **What to show on screen**: Open the home page at `http://localhost:5173`. Show the clean, modern Odoo-inspired interface.
- **What to speak**:
  > *"Hello everyone and esteemed Odoo hackathon judges! Today, I am proud to present our solution for Brightloop Software's Subscription Management challenge.*
  > 
  > *Brightloop Software sells cloud software, recurring add-ons, and product variants. Previously, they tracked customer subscriptions in messy spreadsheets, handled renewals manually, typed invoices by hand each month, and quarterly revenue reporting took days.*
  > 
  > *We built a unified, production-grade recurring billing engine that automates the entire lifecycle: from plan configuration and quotation templates, to automated billing day execution, idempotent invoice generation, tax calculation, payment reconciliation, and real-time executive analytics."*

---

#### [0:45 - 1:45] Products, Dynamic Variants & Plans Configuration
- **What to show on screen**:
  1. Click **Products & Variants** in the sidebar.
  2. Point out **BrightERP Business Suite**. Show the variant badge: **"Odoo Powered Edition (+$560)"**.
  3. Click **Plans & Cycles**.
- **What to speak**:
  > *"First, let's explore product catalog and pricing plans. Here we have BrightERP. As specified in the challenge brief, products support dynamic variants. Notice here: selecting the 'Odoo Powered Edition' dynamically adds $560 to the base price.*
  > 
  > *Under Plans, we support daily, weekly, monthly, and yearly cycles. Notice the admin lifecycle policies configured plan-by-plan: whether a contract auto-closes on expiry, whether it can be paused, renewed, or closed early."*

---

#### [1:45 - 2:45] Quotation to Subscription Pipeline & Lifecycle Stages
- **What to show on screen**:
  1. Click **Quote Templates** in the sidebar. Show **"Odoo Enterprise Suite (30d validity)"**.
  2. Click **Subscriptions & Quotes**. Show the status badges: `Draft`, `Quotation`, `Confirmed`, `Active`, `Paused`, `Closed`.
  3. Click **"Send Quote ➔"** to move a draft to Quotation, then **"Confirm Quote ➔"**, then **"Activate Contract ➔"**.
- **What to speak**:
  > *"Sales reps don't have to build offers from scratch. They can start from predefined Quotation Templates valid for a set number of days.*
  > 
  > *Each subscription receives a unique human-readable number like `SUB-2026-0001` and progresses smoothly through our pipeline: Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ and Closed. Anyone on the sales or operations team can see exactly where each customer stands in real time."*

---

#### [2:45 - 3:45] Billing Day Automated Engine & Idempotency Proof
- **What to show on screen**:
  1. Click the glowing **"Run Billing Day"** button in the top navigation bar.
  2. Show the Target Date (e.g., today's date).
  3. Click **"Execute Billing Run Now"**.
  4. Show the results modal: Invoices Created, Protected/Skipped items.
  5. Click **"Done & Refresh Views"** and jump to **Invoices & Billing**.
- **What to speak**:
  > *"Now, the core of the problem statement: Billing Day. When hundreds of subscriptions become due at once, nobody should type invoices manually.*
  > 
  > *With one click, our recurring billing engine scans all active subscriptions, automatically computes customer lines, applies active discounts, and calculates taxes.*
  > 
  > *Crucially, our engine is completely IDEMPOTENT: it guarantees nothing is ever billed twice, and no due subscription is skipped. If we run it again for the same period, the system detects existing invoices and protects the customer from double billing."*

---

#### [3:45 - 4:30] Discounts, Tax Rules & Payment Reconciliation
- **What to show on screen**:
  1. In the **Invoices** view, click on an invoice to view its detailed receipt. Show the itemized taxes (10% VAT) and the discount rule credit note.
  2. Click **Print / PDF** to show the clean print preview.
  3. Click **Record Payment**, enter an amount, select Credit Card or Bank Transfer, and submit.
  4. Notice the invoice status instantly transitions to **Paid** and balance due drops to $0.00!
- **What to speak**:
  > *"Our invoice layout is production-ready and printable. The admin controls tax rules and discount rules with seat thresholds and usage limits.*
  > 
  > *When money comes in, staff record payments by card, bank wire, or online checkout. The invoice status reconciles instantly from Confirmed to Paid with zero manual paperwork."*

---

#### [4:30 - 5:15] Finance Lead Executive Dashboard (<2s Performance Guarantee)
- **What to show on screen**:
  1. Click **Finance Dashboard**.
  2. Highlight the latency indicator: **"Response: 8ms (Requirement <2s)"**.
  3. Highlight the KPI cards: Active Subscriptions, MRR ($10,480), ARR, Total Collected, and Overdue Balances.
  4. Show the Overdue Chase alert banner.
- **What to speak**:
  > *"For the Finance Lead at month-end, answering revenue and overdue questions previously took days. Our executive dashboard delivers instant clarity on MRR, ARR, cash collected, and overdue receivables.*
  > 
  > *Even with thousands of subscriptions, our architecture responds in under 50 milliseconds—well exceeding the hackathon's 2-second speed requirement!"*

---

#### [5:15 - 5:45] Customer Self-Service Portal & Live "Buy Now" Checkout
- **What to show on screen**:
  1. In the top navigation bar, click the **"Customer Portal"** simulator button.
  2. Click the gold **"Buy / Subscribe Online"** button (or open Plans and click **"Subscribe Now"**).
  3. Show the interactive checkout modal:
     - Select Plan (e.g. Growth Monthly).
     - Select **Odoo Powered Edition (+$560)**.
     - Apply coupon `GROWTH20` (show the price reduce immediately!).
     - Show the tax calculation (10% VAT).
     - Click **"Pay & Activate Subscription"**.
  4. Notice the instant toast notification, new active subscription, and paid invoice receipt appear in the customer's portal immediately!
- **What to speak**:
  > *"Finally, we built a complete end-to-end self-service Buy flow. Customers don't need to email sales to purchase software.
  > 
  > *From their portal, a customer clicks 'Buy Online', selects their plan and product variant—such as the Odoo-powered edition—enters a discount code like `GROWTH20`, and completes simulated payment checkout.
  > 
  > *In a single atomic transaction, the subscription is activated, an official invoice is generated in Paid status, and a payment receipt is stored.
  > 
  > *Thank you! SubscriptIQ connects the complete subscription lifecycle in one centralized platform."*

---

### 💡 Pro Tips for Getting the Highest Score from Odoo Evaluators
1. **Speak with confidence and enthusiasm**: Speak clearly, don't rush, and keep mouse movements steady.
2. **Focus on the Business Problem Solved**: Show how each feature eliminates spreadsheets, prevents double-billing, and speeds up collections.
3. **Keep the Video Under 6 Minutes**: Evaluators have dozens of submissions to review. A crisp 5-minute video that shows a 100% working product will easily stand out in the top percentile!
