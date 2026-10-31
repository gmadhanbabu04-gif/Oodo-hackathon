import React from 'react';
import { 
  Zap, 
  UserCircle, 
  Shield, 
  Briefcase, 
  UserCheck, 
  Layers,
  ChevronDown,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { DEMO_USERS } from '../api';

export default function Navbar({ 
  currentUser, 
  onSwitchRole, 
  onOpenBillingModal, 
  onOpenAuthModal, 
  onLogout 
}) {
  const currentRole = currentUser?.role || 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#714B67] to-[#017E84] flex items-center justify-center shadow-md shadow-purple-900/10 text-white font-extrabold text-xl">
              S
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">SubscriptIQ</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-100 text-[#714B67]">
                  Brightloop Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Smart Subscriptions. Automated Billing. Clear Revenue.</p>
            </div>
          </div>

          {/* Quick Role Switcher for Evaluators & Judges */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2.5">
              Simulate:
            </span>
            <button
              onClick={() => onSwitchRole('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-[#714B67] shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full system control & staff management"
            >
              <Shield className="w-3.5 h-3.5 text-[#714B67]" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => onSwitchRole('staff')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'staff'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Sales & client management with limited admin access"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Staff</span>
            </button>
            <button
              onClick={() => onSwitchRole('customer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'customer'
                  ? 'bg-white text-teal-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Customer self-service portal view"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Customer Portal</span>
            </button>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-3">
            {/* Run Billing Day Action Button (Admin/Staff) */}
            {currentRole !== 'customer' && (
              <button
                onClick={onOpenBillingModal}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#714B67] to-[#017E84] hover:opacity-95 transition-all shadow-sm hover:shadow active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>Run Billing Day</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'Guest User'}
                </div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                  {currentUser?.role || 'Guest'}
                </div>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-md"
                title="Account Settings / Log In with other credentials"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
