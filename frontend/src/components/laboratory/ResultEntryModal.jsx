import React, { useState } from 'react';
import { laboratoryService } from '../../services/laboratoryService';
import { X, CheckCircle, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';

const ResultEntryModal = ({ request, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    result_value: request.result_value || '',
    is_abnormal: !!request.is_abnormal,
    remarks: request.remarks || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await laboratoryService.recordResult(request.id, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record laboratory findings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Enter & Verify Diagnostic Result</h2>
            <p className="text-xs text-slate-500">Order: LAB-{String(request.id).padStart(5, '0')} • {request.test_name}</p>
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

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient:</span>
            <span className="font-semibold text-slate-900">{request.patient_first_name} {request.patient_last_name} ({request.patient_mrn})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Test / Category:</span>
            <span className="font-semibold text-slate-900">{request.test_name} ({request.test_category})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Reference Benchmark:</span>
            <span className="font-mono font-medium text-slate-700">{request.reference_range || 'N/A'} {request.unit || ''}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Result Value / Findings <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={form.result_value}
              onChange={(e) => setForm({ ...form, result_value: e.target.value })}
              placeholder="e.g. 135 mg/dL (or detailed multi-parameter readings)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Abnormal Flag */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <input
              type="checkbox"
              id="is_abnormal"
              checked={form.is_abnormal}
              onChange={(e) => setForm({ ...form, is_abnormal: e.target.checked })}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="is_abnormal" className="text-xs font-semibold text-amber-900 cursor-pointer">
              Flag as Clinically Abnormal / Critical Value
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pathologist / Lab Remarks</label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="e.g. Repeat test recommended in 48 hours"
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              {submitting ? 'Verifying...' : 'Verify & Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultEntryModal;
