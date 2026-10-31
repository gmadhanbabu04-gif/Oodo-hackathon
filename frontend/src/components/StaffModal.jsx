import React, { useState } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function StaffModal({ isOpen, onClose, onStaffAdded }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('Brightloop Sales Team');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live password validation check according to hackathon rules
  const hasMinLength = password.length > 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password must satisfy all security policy requirements.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createStaff({
        name,
        email,
        password,
        companyName,
        phone
      });
      if (onStaffAdded) onStaffAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 my-8">
        <div className="bg-[#714B67] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">Add Staff Member (Admin Only)</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Michael Scott"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@brightloop.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department / Office
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. Staff@2026!"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20 font-mono"
            />
            {/* Live Password Strength Criteria Breakdown */}
            <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-600 block">Password Requirements:</span>
              <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>More than 8 characters</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>At least one lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>At least one special character (!@#$%^&*...)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
