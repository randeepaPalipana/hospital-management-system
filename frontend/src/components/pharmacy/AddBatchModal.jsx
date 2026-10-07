import React, { useState } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import { X, PackagePlus, Loader2, AlertCircle } from 'lucide-react';

const AddBatchModal = ({ medicine, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    batch_number: '',
    expiry_date: '',
    initial_quantity: 100,
    purchase_price: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await pharmacyService.addBatch(medicine.id, {
        batch_number: form.batch_number.trim(),
        expiry_date: form.expiry_date,
        initial_quantity: parseInt(form.initial_quantity, 10),
        purchase_price: parseFloat(form.purchase_price) || 0,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock batch');
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
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Stock Inflow / Batch</h2>
              <p className="text-xs text-slate-500">{medicine.name} ({medicine.strength || ''})</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number *</label>
            <input
              type="text"
              required
              value={form.batch_number}
              onChange={(e) => setForm({ ...form, batch_number: e.target.value.toUpperCase() })}
              placeholder="e.g. BATCH-2026-X12"
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Received Units *</label>
              <input
                type="number"
                min="1"
                required
                value={form.initial_quantity}
                onChange={(e) => setForm({ ...form, initial_quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Cost / Unit ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.purchase_price}
              onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
              placeholder="0.15"
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Adding...' : 'Add Stock Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBatchModal;
