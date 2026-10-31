import React from 'react';
import {
  LayoutDashboard,
  Repeat,
  FileText,
  CreditCard,
  Package,
  CalendarCheck,
  FileCode,
  Tag,
  Users,
  Compass,
  DollarSign,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ currentView, setView, currentUser }) {
  const role = currentUser?.role || 'admin';

  const adminNav = [
    { id: 'dashboard', label: 'Finance Dashboard', icon: LayoutDashboard },
    { id: 'actionCenter', label: 'Smart Action Center', icon: Sparkles },
    { id: 'customers', label: 'Customers & Accounts', icon: UserCheck },
    { id: 'subscriptions', label: 'Subscriptions & Quotes', icon: Repeat },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
    { id: 'payments', label: 'Payments & Records', icon: CreditCard },
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'plans', label: 'Plans & Cycles', icon: CalendarCheck },
    { id: 'templates', label: 'Quote Templates', icon: FileCode },
    { id: 'discounts', label: 'Discounts & Taxes', icon: Tag },
    { id: 'staff', label: 'Staff Management', icon: Users, adminOnly: true }
  ];

  const customerNav = [
    { id: 'portal', label: 'My Portal Overview', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'My Subscriptions', icon: Repeat },
    { id: 'invoices', label: 'My Invoices & Receipts', icon: FileText },
    { id: 'catalog', label: 'Explore Plans & Add-ons', icon: Compass }
  ];

  const items = role === 'customer' ? customerNav : adminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
            {role === 'customer' ? 'Customer Self-Service' : 'Workspace Navigation'}
          </span>
          <nav className="mt-3 space-y-1">
            {items.map((item) => {
              // Hide staff management from staff role
              if (item.adminOnly && role !== 'admin') return null;

              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#714B67] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Tips / Role Insight */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs">
          <div className="font-bold text-slate-800 flex items-center space-x-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Role: {role.toUpperCase()}</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            {role === 'admin' && 'You have full access to create staff, pricing plans, variants, discounts and taxes.'}
            {role === 'staff' && 'You can manage quotations, subscriptions, invoices and log incoming payments.'}
            {role === 'customer' && 'Self-service portal: view active plans, download invoices and settle balances.'}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
        Brightloop v2.4 • Odoo Edition
      </div>
    </aside>
  );
}
