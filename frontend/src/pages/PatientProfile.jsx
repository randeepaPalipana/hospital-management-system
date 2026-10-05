import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Droplet, Calendar, ShieldAlert,
  AlertTriangle, Activity, ClipboardList, Loader2, PencilLine,
} from 'lucide-react';
import PatientFormModal from '../components/patients/PatientFormModal';

const genderColor = { Male: 'bg-sky-100 text-sky-700', Female: 'bg-pink-100 text-pink-700', Other: 'bg-purple-100 text-purple-700' };
const bgColors = { 'A+':'bg-red-100 text-red-700','A-':'bg-red-200 text-red-800','B+':'bg-orange-100 text-orange-700','B-':'bg-orange-200 text-orange-800','O+':'bg-green-100 text-green-700','O-':'bg-green-200 text-green-800','AB+':'bg-purple-100 text-purple-700','AB-':'bg-purple-200 text-purple-800','Unknown':'bg-slate-100 text-slate-500' };

const apptStatusColor = { scheduled:'bg-sky-100 text-sky-700', completed:'bg-emerald-100 text-emerald-700', cancelled:'bg-rose-100 text-rose-700', no_show:'bg-amber-100 text-amber-700' };

const InfoRow = ({ icon: Icon, label, value }) => value ? (
  <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
    <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm text-slate-800 font-semibold">{value}</p>
    </div>
  </div>
) : null;

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await patientService.getHistory(id);
      setHistory(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
    </div>
  );

  if (error) return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700 text-sm">{error}</div>
  );

  const { patient, appointments, medicalRecords } = history;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/patients')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h1>
          <p className="text-sm text-slate-500 font-mono">{patient.mrn}</p>
        </div>
        <button onClick={() => setShowEdit(true)}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50">
          <PencilLine className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Patient Profile Card */}
        <div className="space-y-4">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl font-bold">
                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">{patient.first_name} {patient.last_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${genderColor[patient.gender]}`}>{patient.gender}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${bgColors[patient.blood_group]}`}>{patient.blood_group}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <InfoRow icon={Calendar} label="Date of Birth" value={`${new Date(patient.dob).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} (${patient.age} years)`} />
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={MapPin} label="Address" value={patient.address} />
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.emergency_contact_name && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3 text-amber-800">
                <ShieldAlert className="w-4 h-4" />
                <p className="font-bold text-sm">Emergency Contact</p>
              </div>
              <p className="font-semibold text-slate-900 text-sm">{patient.emergency_contact_name}</p>
              {patient.emergency_contact_relation && <p className="text-xs text-slate-500">{patient.emergency_contact_relation}</p>}
              {patient.emergency_contact_phone && (
                <p className="flex items-center gap-1 text-sm font-medium text-slate-700 mt-1">
                  <Phone className="w-3 h-3" />{patient.emergency_contact_phone}
                </p>
              )}
            </div>
          )}

          {/* Allergies */}
          {patient.allergies && (
            <div className="bg-rose-50 rounded-2xl border border-rose-200 p-4">
              <div className="flex items-center gap-2 mb-2 text-rose-800">
                <AlertTriangle className="w-4 h-4" />
                <p className="font-bold text-sm">Known Allergies</p>
              </div>
              <p className="text-sm text-rose-900">{patient.allergies}</p>
            </div>
          )}
        </div>

        {/* Right: Tabbed History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-4">
            {[
              { key: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
              { key: 'records', label: 'Medical Records', icon: ClipboardList, count: medicalRecords.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 overflow-y-auto max-h-[500px]">
            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              appointments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No appointments recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((a) => (
                    <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">Dr. {a.doctor_name}</p>
                          <p className="text-xs text-slate-500">{a.specialization} — {a.department}</p>
                          {a.reason_for_visit && <p className="text-xs text-slate-600 mt-1 italic">"{a.reason_for_visit}"</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${apptStatusColor[a.status] || 'bg-slate-100 text-slate-600'}`}>
                            {a.status.replace('_', ' ')}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(a.appointment_date).toLocaleDateString()} at {a.time_slot?.substring(0, 5)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Medical Records Tab */}
            {activeTab === 'records' && (
              medicalRecords.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No medical records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medicalRecords.map((mr) => (
                    <div key={mr.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">Dr. {mr.doctor_name} — {mr.specialization}</p>
                          <p className="text-xs text-slate-500 mb-2">{new Date(mr.encounter_date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
                          <p className="text-xs text-slate-700"><span className="font-semibold">Complaint:</span> {mr.chief_complaint}</p>
                          <p className="text-xs text-slate-700 mt-1"><span className="font-semibold">Diagnosis:</span> {mr.diagnosis}</p>
                          {(mr.vitals_bp || mr.vitals_pulse) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {mr.vitals_bp && <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-100">BP: {mr.vitals_bp}</span>}
                              {mr.vitals_pulse && <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">Pulse: {mr.vitals_pulse} bpm</span>}
                              {mr.vitals_temp_c && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-100">Temp: {mr.vitals_temp_c}°C</span>}
                              {mr.vitals_weight_kg && <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{mr.vitals_weight_kg} kg</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <PatientFormModal
          patient={patient}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); fetchHistory(); }}
        />
      )}
    </div>
  );
};

export default PatientProfile;
