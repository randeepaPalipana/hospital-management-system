import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import {
  Calendar as CalendarIcon, Clock, Plus, Search, Filter,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight,
  User, Phone,
} from 'lucide-react';
import AppointmentModal from '../components/appointments/AppointmentModal';
import RescheduleModal from '../components/appointments/RescheduleModal';

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  no_show: { label: 'No Show', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const [apptRes, docRes] = await Promise.all([
        appointmentService.getAll({
          doctorId: selectedDoctor || undefined,
          status: selectedStatus || undefined,
          date: selectedDate || undefined,
        }),
        doctorService.getAll(),
      ]);
      setAppointments(apptRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctor, selectedStatus, selectedDate]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const setFilterToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const clearFilters = () => {
    setSelectedDoctor('');
    setSelectedStatus('');
    setSelectedDate('');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-sky-600" />
            Appointments & Clinic Queue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time consultation scheduling, physician slot availability, and patient queue check-in.
          </p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center flex-1">
          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            onClick={setFilterToday}
            className="px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100"
          >
            Today's Visits
          </button>

          {/* Doctor filter */}
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs"
          >
            <option value="">All Physicians</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.first_name} {d.last_name} ({d.specialization})
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          {(selectedDate || selectedDoctor || selectedStatus) && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
          title="Refresh appointments"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{error}</div>
      )}

      {/* Appointment Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Patient Details</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Physician</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Chief Complaint</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No appointments found</p>
                    <p className="text-xs text-slate-400 mt-1">Book new consultations or clear filters.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => {
                  const statusInfo = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                      {/* Date & Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">
                            {appt.time_slot?.substring(0, 5)}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {new Date(appt.appointment_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 leading-tight">
                          {appt.patient_first_name} {appt.patient_last_name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{appt.patient_mrn} • {appt.patient_phone}</p>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 leading-tight">Dr. {appt.doctor_name}</p>
                        <p className="text-xs text-sky-700 font-medium mt-0.5">
                          {appt.doctor_specialization} (Room {appt.room_number || 'OPD'})
                        </p>
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-xs">
                        <p className="italic line-clamp-2">"{appt.reason_for_visit || 'Routine Consultation'}"</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                                title="Mark Complete"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => setRescheduleAppt(appt)}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
                                title="Reschedule Slot"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'cancelled')}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Cancel Appointment"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {appt.status !== 'scheduled' && (
                            <span className="text-xs text-slate-400 font-mono">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showBookModal && (
        <AppointmentModal
          onClose={() => setShowBookModal(false)}
          onSuccess={() => {
            setShowBookModal(false);
            fetchAppointments();
          }}
        />
      )}

      {rescheduleAppt && (
        <RescheduleModal
          appointment={rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          onSuccess={() => {
            setRescheduleAppt(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default Appointments;
