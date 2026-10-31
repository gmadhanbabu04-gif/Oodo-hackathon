# SubscriptIQ

Subscription Management and Recurring Billing System built for Brightloop Software (Odoo Hackathon).

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: Atomic JSON store with indexed queries

## Features
- **Role-Based Access**: Separate views for Admin, Staff, and Customer Portal
- **Products & Variants**: Product catalog with dynamic variant pricing (Odoo brand adds +$560)
- **Subscription Pipeline**: Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Closed
- **Automated Billing Engine**: Batch invoice generator with duplicate billing prevention
- **Customer Portal**: Self-service subscription management and online checkout
- **Finance Dashboard**: Real-time MRR, ARR, and overdue invoice tracking (<50ms response)

## How to Run Locally

1. Install dependencies:
```bash
npm run install:all
```

2. Seed initial data:
```bash
npm run seed
```

3. Start backend server (Port 5000):
```bash
npm run start:backend
```

4. Start frontend server (Port 5173):
```bash
npm run start:frontend
```

Open `http://localhost:5173` in your browser.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@brightloop.com | Admin@2026! |
| Staff | sarah.sales@brightloop.com | Staff@2026! |
| Customer | john@smallshop.com | Client@2026! |

*All passwords satisfy hackathon requirements (>8 characters, uppercase, lowercase, special character).*
