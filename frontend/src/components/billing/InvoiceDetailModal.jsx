import React, { useState } from 'react';
import { X, Printer, Receipt, CheckCircle2 } from 'lucide-react';
import { formatLKR } from '../../utils/currencyFormatter';

const InvoiceDetailModal = ({ invoice, onClose, onOpenPayment }) => {
  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Patient Invoice</h2>
              <p className="text-xs text-slate-500 font-mono">{invoice.invoice_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Info Details */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
          <div>
            <p className="text-slate-400 font-semibold mb-0.5">Billed To Patient:</p>
            <p className="font-bold text-slate-900 text-sm">{invoice.patient_first_name} {invoice.patient_last_name}</p>
            <p className="font-mono text-slate-600 mt-0.5">{invoice.patient_mrn} • {invoice.patient_phone}</p>
            {invoice.patient_address && <p className="text-slate-500 mt-0.5">{invoice.patient_address}</p>}
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-semibold mb-0.5">Invoice Metadata:</p>
            <p className="text-slate-700">Issued: <span className="font-semibold">{new Date(invoice.created_at).toLocaleDateString()}</span></p>
            {invoice.due_date && (
              <p className="text-slate-700">Due: <span className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</span></p>
            )}
            <div className="mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.status === 'partially_paid'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="flex-1 overflow-y-auto mb-4">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Service Description</th>
                <th className="px-3 py-2 text-left font-semibold">Type</th>
                <th className="px-3 py-2 text-center font-semibold">Qty</th>
                <th className="px-3 py-2 text-right font-semibold">Unit Rate</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{item.description}</td>
                  <td className="px-3 py-2.5 capitalize text-slate-500">{item.item_type}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{formatLKR(item.unit_price)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold">{formatLKR(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payments Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs mb-4">
          <div className="flex justify-between text-slate-600">
            <span>Gross Total:</span>
            <span className="font-mono">{formatLKR(invoice.total_amount)}</span>
          </div>
          {parseFloat(invoice.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount Applied:</span>
              <span className="font-mono">-{formatLKR(invoice.discount_amount)}</span>
            </div>
          )}
          {parseFloat(invoice.tax_amount) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax / Charges:</span>
              <span className="font-mono">+{formatLKR(invoice.tax_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-1">
            <span>Net Amount:</span>
            <span className="font-mono text-emerald-700">{formatLKR(invoice.net_amount)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Amount Paid:</span>
            <span className="font-mono">{formatLKR(invoice.paid_amount)}</span>
          </div>
          <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
            <span>Balance Due:</span>
            <span className="font-mono text-sm">{formatLKR(invoice.balance_due)}</span>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Payment Receipts</p>
            <div className="space-y-1">
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex justify-between text-xs p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <span className="font-mono font-semibold text-emerald-900">{p.receipt_number} ({p.payment_method})</span>
                  <span className="text-slate-500">{new Date(p.payment_date).toLocaleDateString()}</span>
                  <span className="font-mono font-bold text-emerald-800">{formatLKR(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
          {!isPaid && (
            <button
              onClick={() => { onClose(); onOpenPayment(invoice); }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
            >
              Take Payment
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
