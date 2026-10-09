import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import {
  Users, Plus, Search, ChevronLeft, ChevronRight,
  User, Phone, Droplet, CalendarDays, Eye, PencilLine, RefreshCw,
} from 'lucide-react';
import PatientFormModal from '../components/patients/PatientFormModal';

const genderColor = { Male: 'bg-sky-100 text-sky-700', Female: 'bg-pink-100 text-pink-700', Other: 'bg-purple-100 text-purple-700' };
const bgColors = { 'A+':'bg-red-100 text-red-700','A-':'bg-red-200 text-red-800','B+':'bg-orange-100 text-orange-700','B-':'bg-orange-200 text-orange-800','O+':'bg-green-100 text-green-700','O-':'bg-green-200 text-green-800','AB+':'bg-purple-100 text-purple-700','AB-':'bg-purple-200 text-purple-800','Unknown':'bg-slate-100 text-slate-500' };

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);

  const fetchPatients = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await patientService.getAll({
        search: search || undefined,
        gender: gender || undefined,
        page,
        limit: pagination.limit,
      });
      setPatients(data.data || []);
      setPagination(p => ({ ...p, ...data.pagination, page }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [search, gender, pagination.limit]);

  useEffect(() => { fetchPatients(1); }, [search, gender]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditPatient(null);
    fetchPatients(1);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
              {pagination.total} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master patient index, identification numbers, and contact demographics
          </p>
        </div>
        <button
          onClick={() => { setEditPatient(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0275d8] to-[#0052cc] hover:from-[#0066eb] hover:to-[#0047b3] text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by MRN (e.g. HOSP-2026-00001), patient name, or phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0275d8] focus:bg-white transition text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0a446c] hover:bg-[#073554] text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); }}
              className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200 transition font-medium"
            >
              Reset
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-600 font-medium"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button
            onClick={() => fetchPatients(pagination.page)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
            title="Refresh Registry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {error && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Patient Identity</th>
                <th className="px-4 py-3">Age / Gender</th>
                <th className="px-4 py-3 text-center">Blood</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Registered On</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3.5 bg-slate-100 rounded w-4/5"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600">No patients found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search ? `No records matching "${search}"` : 'Begin by registering a new patient record.'}
                    </p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px]">
                        {patient.mrn}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{patient.first_name} {patient.last_name}</div>
                      {patient.email && <div className="text-[11px] text-slate-400 font-mono mt-0.5">{patient.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{patient.age} yrs</div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${bgColors[patient.blood_group] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {patient.blood_group}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[11px] inline-flex items-center gap-1 transition"
                          title="View Patient Chart"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chart</span>
                        </button>
                        <button
                          onClick={() => { setEditPatient(patient); setShowForm(true); }}
                          className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
                          title="Edit Patient Details"
                        >
                          <PencilLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Table Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-2.5 border-t border-slate-200/90 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
            <span>Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total patients)</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchPatients(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fetchPatients(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientFormModal
          patient={editPatient}
          onClose={() => { setShowForm(false); setEditPatient(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Patients;
