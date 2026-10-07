import React, { useState, useEffect } from 'react';
import { laboratoryService } from '../../services/laboratoryService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { X, TestTube, Loader2, AlertCircle } from 'lucide-react';

const LabOrderModal = ({ onClose, onSuccess }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    test_id: '',
    sample_type: 'Whole Blood (EDTA)',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      patientService.getAll({ limit: 100 }),
      doctorService.getAll(),
      laboratoryService.getTests(),
    ])
      .then(([patRes, docRes, testRes]) => {
        const pList = patRes.data.data || [];
        const dList = docRes.data.data || [];
        const tList = testRes.data.data || [];

        setPatients(pList);
        setDoctors(dList);
        setTests(tList);

        if (pList.length > 0) setForm((f) => ({ ...f, patient_id: pList[0].id }));
        if (dList.length > 0) setForm((f) => ({ ...f, doctor_id: dList[0].id }));
        if (tList.length > 0) setForm((f) => ({ ...f, test_id: tList[0].id }));
      })
      .catch(() => setError('Failed to load form options'))
      .finally(() => setLoadingInitial(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await laboratoryService.createRequest({
        patient_id: parseInt(form.patient_id, 10),
        doctor_id: parseInt(form.doctor_id, 10),
        test_id: parseInt(form.test_id, 10),
        sample_type: form.sample_type,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to order lab test');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTest = tests.find((t) => t.id === parseInt(form.test_id, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
              <TestTube className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Order Laboratory Requisition</h2>
              <p className="text-xs text-slate-500">Order diagnostic investigation for patient</p>
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

        {loadingInitial ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient *</label>
              <select
                required
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.mrn}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ordering Physician *</label>
              <select
                required
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Investigation / Test *</label>
              <select
                required
                value={form.test_id}
                onChange={(e) => setForm({ ...form, test_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} [{t.test_code}] — {t.category} (${parseFloat(t.standard_cost).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {selectedTest && (
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl text-xs space-y-1">
                <p className="text-violet-900 font-semibold">{selectedTest.name}</p>
                <p className="text-violet-700">Standard Fee: ${parseFloat(selectedTest.standard_cost).toFixed(2)}</p>
                {selectedTest.reference_range && (
                  <p className="text-violet-600 font-mono">Reference Range: {selectedTest.reference_range} {selectedTest.unit || ''}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specimen / Sample Type</label>
              <select
                value={form.sample_type}
                onChange={(e) => setForm({ ...form, sample_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option>Whole Blood (EDTA)</option>
                <option>Serum (Plain Clot Activator)</option>
                <option>Plasma (Sodium Citrate)</option>
                <option>Clean Catch Midstream Urine</option>
                <option>Sputum Specimen</option>
                <option>Stool Sample</option>
                <option>Swab (Nasopharyngeal / Throat)</option>
                <option>Imaging / Non-Invasive (X-Ray, Ultrasound)</option>
              </select>
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
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Ordering...' : 'Confirm Requisition'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LabOrderModal;
