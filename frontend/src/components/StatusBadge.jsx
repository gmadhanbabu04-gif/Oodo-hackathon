import React from 'react';

export default function StatusBadge({ status, type = 'general' }) {
  const s = (status || '').toLowerCase();

  const configs = {
    // Subscription statuses
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Draft' },
    quotation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Quotation' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: 'Confirmed' },
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Active' },
    paused: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', label: 'Paused' },
    closed: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', label: 'Closed' },

    // Invoice statuses
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Paid' },
    overdue: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-400', label: 'Overdue' },
    cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300', label: 'Cancelled' },

    // Billing cycles
    daily: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Daily' },
    weekly: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Weekly' },
    monthly: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Monthly' },
    yearly: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Yearly' },

    // User Roles
    admin: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', label: 'Admin' },
    staff: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', label: 'Staff' },
    customer: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300', label: 'Customer' },
  };

  const config = configs[s] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {config.label}
    </span>
  );
}
