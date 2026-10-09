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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Consultation Queue & Appointments
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              OPD Clinic Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time outpatient consultation slots, physician session allocations, and patient arrival statuses.
          </p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Book Consultation
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 focus:outline-none"
            />
          </div>

          <button
            onClick={setFilterToday}
            className="px-2.5 py-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-800 text-xs font-medium hover:bg-sky-100 transition-colors"
          >
            Today's Queue
          </button>

          {/* Doctor filter */}
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-xs"
          >
            <option value="">All Consulting Doctors</option>
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
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1.5 py-1"
            >
              Reset
            </button>
          )}
        </div>

        <button
          onClick={fetchAppointments}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Refresh Queue"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>
      )}

      {/* Appointment Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Slot & Date</th>
                <th className="px-4 py-2.5 text-left">Patient Details</th>
                <th className="px-4 py-2.5 text-left">Consulting Physician</th>
                <th className="px-4 py-2.5 text-left">Reason / Chief Complaint</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3.5 bg-slate-100 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="font-semibold text-slate-700 text-sm">No Appointments Found</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust filters or book a new outpatient consultation.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => {
                  const statusInfo = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date & Time */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                            {appt.time_slot?.substring(0, 5)}
                          </span>
                          <span className="text-xs text-slate-600 font-medium font-mono">
                            {new Date(appt.appointment_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 leading-tight">
                          {appt.patient_first_name} {appt.patient_last_name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {appt.patient_mrn} • {appt.patient_phone}
                        </p>
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 leading-tight">Dr. {appt.doctor_name}</p>
                        <p className="text-[11px] text-sky-800 font-medium mt-0.5">
                          {appt.doctor_specialization} <span className="text-slate-400 font-normal">|</span> Room {appt.room_number || 'OPD'}
                        </p>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">
                        <p className="truncate text-slate-700">
                          {appt.reason_for_visit || 'Routine Consultation'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'completed')}
                                className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors"
                                title="Mark Completed"
                              >
                                Completed
                              </button>
                              <button
                                onClick={() => setRescheduleAppt(appt)}
                                className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
                                title="Reschedule"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'cancelled')}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Cancel"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {appt.status !== 'scheduled' && (
                            <span className="text-[11px] text-slate-400 font-mono">—</span>
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
