import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-900/90 text-white border-emerald-700',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    },
    error: {
      bg: 'bg-rose-900/90 text-white border-rose-700',
      icon: AlertCircle,
      iconColor: 'text-rose-400'
    },
    info: {
      bg: 'bg-slate-900/90 text-white border-slate-700',
      icon: Info,
      iconColor: 'text-sky-400'
    }
  }[type] || {
    bg: 'bg-slate-900/90 text-white border-slate-700',
    icon: Info,
    iconColor: 'text-sky-400'
  };

  const Icon = typeConfig.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${typeConfig.bg} text-xs font-medium`}>
        <Icon className={`w-4 h-4 shrink-0 ${typeConfig.iconColor}`} />
        <span>{message}</span>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
