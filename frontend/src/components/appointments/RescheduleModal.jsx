import React, { useState } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { X, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';

const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    appointment_date: appointment.appointment_date ? appointment.appointment_date.substring(0, 10) : '',
    time_slot: appointment.time_slot ? appointment.time_slot.substring(0, 5) : '09:00',
    notes: appointment.notes || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await appointmentService.reschedule(appointment.id, {
        appointment_date: form.appointment_date,
        time_slot: form.time_slot.length === 5 ? `${form.time_slot}:00` : form.time_slot,
        notes: form.notes,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule appointment');
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
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Reschedule Appointment</h2>
              <p className="text-xs text-slate-500">
                Patient: {appointment.patient_first_name} {appointment.patient_last_name}
              </p>
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
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="font-semibold text-slate-700">Current Booking Details</p>
            <p className="text-slate-600 mt-0.5">
              Doctor: <span className="font-semibold text-slate-800">Dr. {appointment.doctor_name}</span> ({appointment.doctor_specialization})
            </p>
            <p className="text-slate-500 font-mono mt-0.5">
              {appointment.appointment_date?.substring(0, 10)} at {appointment.time_slot?.substring(0, 5)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Appointment Date *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Time Slot *</label>
            <input
              type="time"
              required
              value={form.time_slot}
              onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reschedule Reason / Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Patient requested morning slot change..."
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
