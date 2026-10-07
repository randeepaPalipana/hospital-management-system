import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../../services/medicalRecordService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import {
  X, FileText, HeartPulse, Pill, Plus, Trash2,
  Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';

const EncounterModal = ({ onClose, onSuccess, initialPatientId, initialAppointmentId }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form states
  const [form, setForm] = useState({
    patient_id: initialPatientId || '',
    doctor_id: '',
    appointment_id: initialAppointmentId || '',
    chief_complaint: '',
    vitals_bp: '',
    vitals_pulse: '',
    vitals_temp_c: '',
    vitals_spo2: '',
    vitals_weight_kg: '',
    examination_notes: '',
    diagnosis: '',
    treatment_plan: '',
    prescription_notes: '',
  });

  // Prescription line items
  const [prescriptionItems, setPrescriptionItems] = useState([]);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      patientService.getAll({ limit: 100 }),
      doctorService.getAll(),
      medicalRecordService.getMedicines(),
    ])
      .then(([patRes, docRes, medRes]) => {
        const pList = patRes.data.data || [];
        const dList = docRes.data.data || [];
        const mList = medRes.data.data || [];

        setPatients(pList);
        setDoctors(dList);
        setMedicines(mList);

        if (!form.patient_id && pList.length > 0) {
          setForm((f) => ({ ...f, patient_id: pList[0].id }));
        }
        if (dList.length > 0) {
          setForm((f) => ({ ...f, doctor_id: dList[0].id }));
        }
      })
      .catch(() => setError('Failed to load initial data'))
      .finally(() => setLoadingInitial(false));
  }, []);

  const handleAddMedicine = () => {
    if (medicines.length === 0) return;
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicine_id: medicines[0].id,
        dosage: '500mg',
        frequency: 'Twice daily (BID)',
        duration_days: 5,
        quantity_prescribed: 10,
        instructions: 'Take after meals',
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        patient_id: parseInt(form.patient_id, 10),
        doctor_id: parseInt(form.doctor_id, 10),
        appointment_id: form.appointment_id ? parseInt(form.appointment_id, 10) : null,
        vitals_pulse: form.vitals_pulse ? parseInt(form.vitals_pulse, 10) : null,
        vitals_temp_c: form.vitals_temp_c ? parseFloat(form.vitals_temp_c) : null,
        vitals_spo2: form.vitals_spo2 ? parseInt(form.vitals_spo2, 10) : null,
        vitals_weight_kg: form.vitals_weight_kg ? parseFloat(form.vitals_weight_kg) : null,
        prescription_items: prescriptionItems.map((item) => ({
          ...item,
          medicine_id: parseInt(item.medicine_id, 10),
          duration_days: parseInt(item.duration_days, 10) || 5,
          quantity_prescribed: parseInt(item.quantity_prescribed, 10) || 1,
        })),
      };

      await medicalRecordService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save clinical encounter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Clinical Encounter Documentation (EMR)</h2>
              <p className="text-xs text-slate-500">Record examination findings, vitals, diagnosis, and issue prescription</p>
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
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1">
            {/* Patient & Doctor Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient *</label>
                <select
                  required
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.mrn}) — {p.gender}, {p.blood_group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Doctor *</label>
                <select
                  required
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vitals Triage Row */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Patient Vital Signs
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={form.vitals_bp}
                    onChange={(e) => setForm({ ...form, vitals_bp: e.target.value })}
                    placeholder="120/80"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={form.vitals_pulse}
                    onChange={(e) => setForm({ ...form, vitals_pulse: e.target.value })}
                    placeholder="75"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.vitals_temp_c}
                    onChange={(e) => setForm({ ...form, vitals_temp_c: e.target.value })}
                    placeholder="37.0"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Oxygen Sat (SpO2 %)</label>
                  <input
                    type="number"
                    value={form.vitals_spo2}
                    onChange={(e) => setForm({ ...form, vitals_spo2: e.target.value })}
                    placeholder="99"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.vitals_weight_kg}
                    onChange={(e) => setForm({ ...form, vitals_weight_kg: e.target.value })}
                    placeholder="70.5"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Examination & Diagnosis */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  value={form.chief_complaint}
                  onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                  placeholder="e.g. Sharp epigastric pain radiating to back for 2 days"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Gastritis / Peptic Ulcer Disease"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Findings</label>
                  <textarea
                    rows={2}
                    value={form.examination_notes}
                    onChange={(e) => setForm({ ...form, examination_notes: e.target.value })}
                    placeholder="Abdominal tenderness, palpation findings..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Plan / Advisory</label>
                  <textarea
                    rows={2}
                    value={form.treatment_plan}
                    onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
                    placeholder="Dietary changes, follow-up in 10 days..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Prescription Composer */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Prescription Order ({prescriptionItems.length})
                </p>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Medication
                </button>
              </div>

              {prescriptionItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No medication prescribed for this encounter. Click "+ Add Medication" to add items from the hospital formulary.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-end">
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Medicine</label>
                        <select
                          value={item.medicine_id}
                          onChange={(e) => handleMedicineChange(index, 'medicine_id', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                        >
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.generic_name}) {m.strength}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Dosage</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          placeholder="e.g. 1 Tab"
                          className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Frequency</label>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                          placeholder="Twice daily"
                          className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Duration</label>
                        <input
                          type="number"
                          min="1"
                          value={item.duration_days}
                          onChange={(e) => handleMedicineChange(index, 'duration_days', e.target.value)}
                          placeholder="5 days"
                          className="w-full px-2 py-1.5 text-xs bg-white border rounded-lg"
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pb-0.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Saving Encounter...' : 'Finalize Medical Record'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EncounterModal;
