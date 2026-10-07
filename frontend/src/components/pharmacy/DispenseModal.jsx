import React, { useState } from 'react';
import { pharmacyService } from '../../services/pharmacyService';
import { X, CheckCircle2, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';

const DispenseModal = ({ prescription, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmDispense = async () => {
    setError('');
    setSubmitting(true);
    try {
      await pharmacyService.dispense(prescription.id);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispense prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const hasShortage = prescription.items?.some(
    (item) => item.available_stock < item.quantity_prescribed
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Dispense Pharmaceutical Prescription</h2>
            <p className="text-xs text-slate-500">
              RX-{String(prescription.id).padStart(5, '0')} • Patient: {prescription.patient_first_name} {prescription.patient_last_name} ({prescription.patient_mrn})
            </p>
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

        {hasShortage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>Warning: Some prescribed medications exceed currently available batch inventory!</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-4">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Medicine</th>
                <th className="px-3 py-2 text-left font-semibold">Dosage & Frequency</th>
                <th className="px-3 py-2 text-center font-semibold">Required</th>
                <th className="px-3 py-2 text-center font-semibold">In Stock</th>
                <th className="px-3 py-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.items?.map((item) => {
                const isShort = item.available_stock < item.quantity_prescribed;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5">
                      <p className="font-bold text-slate-900">{item.medicine_name}</p>
                      <p className="text-[11px] text-slate-500">{item.strength || ''} • {item.dosage_form}</p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <p>{item.dosage} — {item.frequency}</p>
                      <p className="text-[11px] text-slate-500">{item.duration_days} days</p>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-900">
                      {item.quantity_prescribed}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono">
                      <span className={isShort ? 'text-rose-600 font-bold' : 'text-emerald-700 font-medium'}>
                        {item.available_stock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {isShort ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                          AVAILABLE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDispense}
            disabled={submitting || hasShortage}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? 'Dispensing...' : 'Confirm & Deduct Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispenseModal;
