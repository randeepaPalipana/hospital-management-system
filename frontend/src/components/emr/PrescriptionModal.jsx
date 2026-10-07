import React, { useState } from 'react';
import { medicalRecordService } from '../../services/medicalRecordService';
import { X, Pill, CheckCircle2, Clock, Calendar, User, Printer } from 'lucide-react';

const PrescriptionModal = ({ prescription, onClose, onRefresh }) => {
  const [updating, setUpdating] = useState(false);

  const handleDispense = async () => {
    setUpdating(true);
    try {
      await medicalRecordService.updatePrescriptionStatus(prescription.id, 'dispensed');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update prescription status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              Rx
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Medical Prescription</h2>
              <p className="text-xs text-slate-500 font-mono">RX-{String(prescription.id).padStart(5, '0')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              title="Print Prescription"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Header */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
          <div>
            <p className="text-slate-500">Patient:</p>
            <p className="font-bold text-slate-900 text-sm">{prescription.patient_name}</p>
            <p className="font-mono text-slate-600 mt-0.5">{prescription.patient_mrn}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Physician:</p>
            <p className="font-bold text-slate-900 text-sm">Dr. {prescription.doctor_name}</p>
            <p className="text-slate-600 mt-0.5">{prescription.doctor_specialization}</p>
          </div>
        </div>

        {/* Medication Table */}
        <div className="flex-1 overflow-y-auto mb-4">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Medication & Form</th>
                <th className="px-3 py-2 text-left font-semibold">Dosage</th>
                <th className="px-3 py-2 text-left font-semibold">Frequency</th>
                <th className="px-3 py-2 text-left font-semibold">Duration</th>
                <th className="px-3 py-2 text-right font-semibold">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.items?.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-bold text-slate-900">{item.medicine_name}</p>
                    <p className="text-[11px] text-slate-500">{item.generic_name} • {item.dosage_form}</p>
                    {item.instructions && <p className="text-[11px] text-emerald-700 italic mt-0.5">Instructions: {item.instructions}</p>}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{item.dosage}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-700">{item.frequency}</td>
                  <td className="px-3 py-2.5 text-slate-600">{item.duration_days} days</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">{item.quantity_prescribed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                prescription.status === 'dispensed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {prescription.status}
            </span>
          </div>

          <div className="flex gap-2">
            {prescription.status === 'pending' && (
              <button
                onClick={handleDispense}
                disabled={updating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Dispensed (Pharmacy)
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
    </div>
  );
};

export default PrescriptionModal;
