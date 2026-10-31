import React, { useState, useEffect } from 'react';
import { FileCode, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function TemplatesView({ onApplyTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuotationTemplates().then(res => {
      setTemplates(res || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Quotation Templates Library</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configured plans, standard product line packages, and validity durations for rapid sales proposals
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#714B67] border border-purple-200 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Valid for {t.validityDays} Days</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-3">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{t.notes}</p>

                {/* Preset Lines */}
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Preset Product Lines Included:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {(t.lines || []).map((l, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>
                          {l.productName} {l.variant ? `(${l.variant})` : ''} &times; {l.quantity}
                        </span>
                        <span className="font-mono font-bold">${l.unitPrice * l.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onApplyTemplate(t)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Quote from this Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
