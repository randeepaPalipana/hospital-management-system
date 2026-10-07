import React, { useState } from 'react';
import { doctorService } from '../../services/doctorService';
import { X, Calendar, Clock, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorScheduleModal = ({ doctor, schedules, onClose, onRefresh }) => {
  const [form, setForm] = useState({
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '13:00',
    slot_duration_minutes: 15,
    max_patients: 16,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await doctorService.addSchedule(doctor.id, {
        ...form,
        start_time: form.start_time.length === 5 ? `${form.start_time}:00` : form.start_time,
        end_time: form.end_time.length === 5 ? `${form.end_time}:00` : form.end_time,
        slot_duration_minutes: parseInt(form.slot_duration_minutes, 10),
        max_patients: parseInt(form.max_patients, 10),
      });
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add schedule slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule slot?')) return;
    try {
      await doctorService.deleteSchedule(doctor.id, scheduleId);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule slot');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Clinic Schedule — Dr. {doctor.first_name} {doctor.last_name}
              </h2>
              <p className="text-xs text-slate-500">{doctor.specialization} • Room {doctor.room_number || 'TBD'}</p>
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

        {/* Existing Schedules */}
        <div className="flex-1 overflow-y-auto mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Weekly Slots</p>
          {schedules.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4 text-center">No schedule slots defined yet.</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800 w-24">{s.day_of_week}</span>
                    <span className="flex items-center gap-1 font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                      <Clock className="w-3.5 h-3.5" />
                      {s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {s.slot_duration_minutes} min/slot • Max {s.max_patients} patients
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Slot Form */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Add Consultation Slot</p>
          <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Day</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border rounded-lg"
              >
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-2 py-2 text-xs bg-slate-50 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Time</label>
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-2 py-2 text-xs bg-slate-50 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Patients</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.max_patients}
                onChange={(e) => setForm({ ...form, max_patients: e.target.value })}
                className="w-full px-2 py-2 text-xs bg-slate-50 border rounded-lg"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add Slot
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleModal;
