import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { X, Calendar, Clock, User, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { formatLKR } from '../../utils/currencyFormatter';

const AppointmentModal = ({ onClose, onSuccess }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    time_slot: '09:00',
    reason_for_visit: '',
    notes: '',
  });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      patientService.getAll({ limit: 100 }),
      doctorService.getAll(),
    ])
      .then(([patRes, docRes]) => {
        const pList = patRes.data.data || [];
        const dList = docRes.data.data || [];
        setPatients(pList);
        setDoctors(dList);

        if (pList.length > 0) setForm((f) => ({ ...f, patient_id: pList[0].id }));
        if (dList.length > 0) setForm((f) => ({ ...f, doctor_id: dList[0].id }));
      })
      .catch((err) => {
        setError('Failed to load patients or doctors');
      })
      .finally(() => setLoadingInitial(false));
  }, []);

  // Check availability when doctor or date changes
  useEffect(() => {
    if (!form.doctor_id || !form.appointment_date) return;
    setCheckingSlots(true);
    appointmentService
      .getDoctorAvailability(form.doctor_id, form.appointment_date)
      .then((res) => {
        setBookedSlots(res.data.data?.bookedSlots || []);
        setDoctorSchedules(res.data.data?.schedules || []);
      })
      .catch(() => {})
      .finally(() => setCheckingSlots(false));
  }, [form.doctor_id, form.appointment_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        patient_id: parseInt(form.patient_id, 10),
        doctor_id: parseInt(form.doctor_id, 10),
        time_slot: form.time_slot.length === 5 ? `${form.time_slot}:00` : form.time_slot,
      };
      await appointmentService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === parseInt(form.doctor_id, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Schedule Patient Appointment</h2>
              <p className="text-xs text-slate-500">Book consultation slot with assigned physician</p>
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
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.mrn}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician *</label>
              <select
                required
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name} — {d.specialization} ({formatLKR(d.consultation_fee)})
                  </option>
                ))}
              </select>
              {selectedDoctor && (
                <p className="text-xs text-sky-700 mt-1">
                  Department: <span className="font-semibold">{selectedDoctor.department_name}</span> • Room: {selectedDoctor.room_number || 'OPD'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
                <input
                  type="time"
                  required
                  value={form.time_slot}
                  onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Doctor availability indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700">Doctor Slot Status</span>
                {checkingSlots && <span className="text-slate-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> checking...</span>}
              </div>
              {bookedSlots.length > 0 ? (
                <div>
                  <span className="text-slate-500">Already booked slots on this date: </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {bookedSlots.map((slot) => (
                      <span key={slot} className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-mono font-medium">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-emerald-700 font-medium">No conflicting appointments booked on this date yet.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Chief Complaint</label>
              <input
                type="text"
                value={form.reason_for_visit}
                onChange={(e) => setForm({ ...form, reason_for_visit: e.target.value })}
                placeholder="e.g. Hypertension check, Follow-up consultation"
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical / Reception Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Pre-visit instructions, referral remarks..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
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
                {submitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
