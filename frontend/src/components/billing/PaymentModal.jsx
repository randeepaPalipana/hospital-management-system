import React, { useState } from 'react';
import { billingService } from '../../services/billingService';
import { X, CreditCard, DollarSign, Loader2, AlertCircle } from 'lucide-react';

const METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Money'];

const PaymentModal = ({ invoice, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    amount: invoice.balance_due ? parseFloat(invoice.balance_due).toFixed(2) : '',
    payment_method: 'Cash',
    transaction_reference: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await billingService.recordPayment(invoice.id, {
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        transaction_reference: form.transaction_reference.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Record Patient Payment</h2>
              <p className="text-xs text-slate-500">{invoice.invoice_number} • {invoice.patient_first_name} {invoice.patient_last_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 mb-4">
          <div className="flex justify-between text-slate-600">
            <span>Net Invoice Total:</span>
            <span className="font-mono font-semibold">${parseFloat(invoice.net_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Already Paid:</span>
            <span className="font-mono font-semibold">${parseFloat(invoice.paid_amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
            <span>Outstanding Balance:</span>
            <span className="font-mono text-rose-700 text-sm">${parseFloat(invoice.balance_due).toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={parseFloat(invoice.balance_due)}
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Reference / Cheque No.</label>
            <input
              type="text"
              value={form.transaction_reference}
              onChange={(e) => setForm({ ...form, transaction_reference: e.target.value })}
              placeholder="e.g. TXN-CARD-449102"
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Remarks</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Cashier receipt notes..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Processing...' : 'Accept Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
