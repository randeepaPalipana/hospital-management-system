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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-600" />
            Patient Registry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} registered patient{pagination.total !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <button
          onClick={() => { setEditPatient(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm shadow-sky-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, MRN, phone or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-500">Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200">Clear</button>
          )}
        </form>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button onClick={() => fetchPatients(pagination.page)} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">MRN</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Patient Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Age / Gender</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Blood Group</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Registered</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No patients found</p>
                    <p className="text-xs mt-1">
                      {search ? `No results for "${search}"` : 'Register the first patient to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
                        {patient.mrn}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{patient.first_name} {patient.last_name}</div>
                      {patient.email && <div className="text-xs text-slate-500">{patient.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{patient.age} yrs</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genderColor[patient.gender] || 'bg-slate-100 text-slate-600'}`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${bgColors[patient.blood_group] || bgColors['Unknown']}`}>
                        {patient.blood_group}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <Phone className="w-3 h-3" />
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditPatient(patient); setShowForm(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Edit Patient"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPatients(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchPatients(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
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
