import React, { useState } from 'react';
import { 
  Printer, 
  Send, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  CreditCard, 
  X, 
  Calendar, 
  Building, 
  FileText 
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { api } from '../api';

export default function InvoiceModal({ 
  invoice, 
  isOpen, 
  onClose, 
  onRefresh, 
  onOpenPayment,
  currentUser 
}) {
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen || !invoice) return null;

  const isCustomer = currentUser?.role === 'customer';

  async function handleStatusChange(newStatus) {
    try {
      await api.updateInvoiceStatus(invoice.id, newStatus);
      setStatusMessage(`Invoice updated to ${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSendEmail() {
    setSending(true);
    try {
      const res = await api.sendInvoiceEmail(invoice.id);
      setStatusMessage(res.message);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Actions bar (no-print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <StatusBadge status={invoice.status} />
            <span className="text-xs font-mono font-bold text-slate-600">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status change actions for staff/admin */}
            {!isCustomer && invoice.status === 'draft' && (
              <button
                onClick={() => handleStatusChange('confirmed')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm Invoice</span>
              </button>
            )}

            {!isCustomer && invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            {/* Email simulation */}
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
              title="Simulate sending invoice PDF via email"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>{sending ? 'Sending...' : 'Email Customer'}</span>
            </button>

            {/* Print action */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-purple-600" />
              <span>Print / PDF</span>
            </button>

            {/* Pay Balance button if outstanding */}
            {invoice.balanceDue > 0 && invoice.status !== 'cancelled' && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenPayment) onOpenPayment(invoice);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{isCustomer ? 'Pay Online Now' : 'Record Payment'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="no-print bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs px-6 py-2">
            {statusMessage}
          </div>
        )}

        {/* Printable Invoice Body */}
        <div id="printable-invoice" className="p-8 space-y-8 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#714B67] to-[#017E84] flex items-center justify-center text-white font-extrabold text-lg">
                  B
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Brightloop Software</h1>
                  <p className="text-xs text-slate-500 font-medium">Subscription & Enterprise Billing</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                100 Innovation Parkway, Suite 400<br />
                billing@brightloopsoftware.com • (555) 019-2831
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-[#714B67] tracking-tight uppercase">
                INVOICE
              </span>
              <div className="font-mono text-sm font-bold text-slate-800 mt-1">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Ref: <span className="font-semibold text-slate-700">{invoice.subscriptionNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Dates & Bill To Grid */}
          <div className="grid grid-cols-2 gap-8 border-y border-slate-200 py-6 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Billed To
              </span>
              <div className="font-bold text-sm text-slate-900">
                {invoice.customerName || 'Valued Customer'}
              </div>
              <div className="text-slate-600 mt-0.5">{invoice.customerEmail}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Invoice Date
                </span>
                <div className="font-semibold text-slate-800">{invoice.invoiceDate || 'N/A'}</div>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Due Date
                </span>
                <div className={`font-semibold ${invoice.balanceDue > 0 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                  {invoice.dueDate || 'Immediate'}
                </div>
              </div>
              <div className="col-span-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Billing Period Covered
                </span>
                <div className="text-slate-700">
                  {invoice.billingPeriodStart} to {invoice.billingPeriodEnd}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Description & Variant</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(invoice.lines || []).map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <div className="font-bold text-slate-800">
                        {line.productName || 'Subscription Line Item'}
                      </div>
                      {line.variant && (
                        <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-[#714B67] border border-purple-200">
                          {line.variant}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-700">
                      {line.quantity}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-slate-700">
                      ${Number(line.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      ${Number(line.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation Breakdown */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">${Number(invoice.subtotal || 0).toFixed(2)}</span>
              </div>

              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-${Number(invoice.discountTotal).toFixed(2)}</span>
                </div>
              )}

              {invoice.discountAppliedNote && (
                <div className="text-[10px] text-emerald-700 italic text-right">
                  {invoice.discountAppliedNote}
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tax ({invoice.taxRate || 10}%):</span>
                <span className="font-mono font-medium">${Number(invoice.taxTotal || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-[#714B67]">
                  ${Number(invoice.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Paid to Date:</span>
                <span className="font-mono font-medium text-emerald-600">
                  ${Number(invoice.paidAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>Balance Due:</span>
                <span className={`font-mono text-base ${invoice.balanceDue > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-600'}`}>
                  ${Number(invoice.balanceDue || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Footer */}
          <div className="border-t border-slate-200 pt-6 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 uppercase tracking-wider">Payment Instructions & Terms</div>
            <p>
              Payment due upon receipt or within designated terms. Electronic payments accepted via Credit Card, ACH Wire Transfer, or Customer Portal.
            </p>
            {invoice.notes && (
              <p className="italic text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                Note: {invoice.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
