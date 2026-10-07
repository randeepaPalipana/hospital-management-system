import React, { useState, useEffect } from 'react';
import { doctorService, departmentService } from '../services/doctorService';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck, Building2, Plus, Search, Calendar,
  DollarSign, MapPin, Phone, Mail, Clock, PencilLine, Eye, RefreshCw,
} from 'lucide-react';
import DoctorFormModal from '../components/doctors/DoctorFormModal';
import DepartmentFormModal from '../components/doctors/DepartmentFormModal';
import DoctorScheduleModal from '../components/doctors/DoctorScheduleModal';

const Doctors = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'departments'

  // Doctors state
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [doctorSchedules, setDoctorSchedules] = useState([]);

  const isAdmin = hasRole('Administrator');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorService.getAll({
          departmentId: selectedDept || undefined,
          search: search || undefined,
        }),
        departmentService.getAll(),
      ]);
      setDoctors(docRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors & departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenSchedule = async (doctor) => {
    try {
      const res = await doctorService.getSchedules(doctor.id);
      setDoctorSchedules(res.data.data || []);
      setScheduleDoctor(doctor);
    } catch (err) {
      alert('Failed to load doctor schedule');
    }
  };

  const refreshSchedules = async () => {
    if (!scheduleDoctor) return;
    const res = await doctorService.getSchedules(scheduleDoctor.id);
    setDoctorSchedules(res.data.data || []);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-sky-600" />
            Physicians & Departments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage medical specialists, clinic consultation fees, and weekly duty rosters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => { setEditDept(null); setShowDeptModal(true); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-xs"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              + Department
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => { setEditDoctor(null); setShowDoctorModal(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              Register Doctor
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'doctors'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Specialists ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departments ({departments.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{error}</div>
      )}

      {/* TAB 1: DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doctor name, specialization, license..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-500">
                Search
              </button>
            </form>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button onClick={fetchData} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Doctors Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 p-5 animate-pulse" />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-slate-600">No doctors found</p>
              <p className="text-xs text-slate-400 mt-1">Register specialists to start scheduling appointments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                          {doc.first_name?.charAt(0)}{doc.last_name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            Dr. {doc.first_name} {doc.last_name}
                          </h3>
                          <p className="text-xs font-semibold text-sky-700 mt-0.5">{doc.specialization}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {doc.department_code}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 py-2 border-t border-b border-slate-100 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">License:</span>
                        <span className="font-mono font-medium">{doc.license_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Consultation Fee:</span>
                        <span className="font-bold text-emerald-700">${parseFloat(doc.consultation_fee).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Clinic Room:</span>
                        <span className="font-medium text-slate-800">{doc.room_number || 'OPD'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Contact:</span>
                        <span>{doc.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleOpenSchedule(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs border border-sky-200 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      View Schedules
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { setEditDoctor(doc); setShowDoctorModal(true); }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Doctor"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Department Name</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Physicians</th>
                {isAdmin && <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{d.name}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs max-w-md truncate">{d.description || '—'}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {d.doctor_count || 0}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => { setEditDept(d); setShowDeptModal(true); }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Edit Department"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showDoctorModal && (
        <DoctorFormModal
          doctor={editDoctor}
          onClose={() => { setShowDoctorModal(false); setEditDoctor(null); }}
          onSuccess={() => { setShowDoctorModal(false); setEditDoctor(null); fetchData(); }}
        />
      )}

      {showDeptModal && (
        <DepartmentFormModal
          department={editDept}
          onClose={() => { setShowDeptModal(false); setEditDept(null); }}
          onSuccess={() => { setShowDeptModal(false); setEditDept(null); fetchData(); }}
        />
      )}

      {scheduleDoctor && (
        <DoctorScheduleModal
          doctor={scheduleDoctor}
          schedules={doctorSchedules}
          onClose={() => setScheduleDoctor(null)}
          onRefresh={refreshSchedules}
        />
      )}
    </div>
  );
};

export default Doctors;
