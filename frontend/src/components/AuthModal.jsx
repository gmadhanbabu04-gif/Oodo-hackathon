import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, Check, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { api, setActiveUser } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [simulatedLink, setSimulatedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // Password validation checks for register / reset
  const targetPass = mode === 'reset' ? newPassword : password;
  const hasMinLength = targetPass.length > 8;
  const hasUpper = /[A-Z]/.test(targetPass);
  const hasLower = /[a-z]/.test(targetPass);
  const hasSpecial = /[^A-Za-z0-9]/.test(targetPass);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password must satisfy all security requirements.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name,
        email,
        password,
        companyName
      });
      if (onAuthSuccess) onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(email);
      setInfoMessage(res.message);
      if (res.token) {
        setResetToken(res.token);
        setSimulatedLink(res.simulatedResetLink);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password must satisfy all security requirements.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword(email, resetToken, newPassword);
      setInfoMessage(res.message);
      setMode('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-[#714B67] to-[#017E84] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">
              {mode === 'login' && 'Sign In to Brightloop'}
              {mode === 'register' && 'New Customer Registration'}
              {mode === 'forgot' && 'Reset Password Request'}
              {mode === 'reset' && 'Set New Password'}
            </h3>
            <p className="text-xs text-white/80">Brightloop Subscription Platform</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                mode === 'login'
                  ? 'border-[#714B67] text-[#714B67]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                mode === 'register'
                  ? 'border-[#714B67] text-[#714B67]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('forgot'); setError(null); }}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                mode === 'forgot' || mode === 'reset'
                  ? 'border-[#714B67] text-[#714B67]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {infoMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@brightloop.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#714B67]/20"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[#714B67] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] disabled:opacity-50 shadow-md shadow-purple-900/10"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Enterprises"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work Email (Unique per account)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. Secret@2026!"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                {/* Live validation indicator */}
                <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-600 block">Required Policy:</span>
                  <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>More than 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>One special character (!@#$...)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] disabled:opacity-50 shadow-md shadow-purple-900/10 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Customer Sign Up'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <form onSubmit={handleForgot} className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address. We will generate and dispatch a secure reset link.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Send Reset Link'}
                </button>
              </form>

              {simulatedLink && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#714B67]">
                    <KeyRound className="w-4 h-4" />
                    <span>Dispatched Reset Token (Simulation)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 break-all">
                    Token: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border">{resetToken}</code>
                  </p>
                  <button
                    onClick={() => setMode('reset')}
                    className="text-xs font-bold text-emerald-700 underline flex items-center space-x-1"
                  >
                    <span>Click here to set new password using token</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="NewSecurePass@2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
                {/* Live validation indicator */}
                <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <span className="font-bold text-slate-600 block">Password Requirements:</span>
                  <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>More than 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Special character (!@#$...)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 mt-2"
              >
                {loading ? 'Updating...' : 'Set New Password & Log In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
