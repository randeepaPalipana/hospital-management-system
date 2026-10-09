import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Droplet, Calendar, ShieldAlert,
  AlertTriangle, Activity, ClipboardList, Loader2, PencilLine, FileText,
  Upload, Trash2, ExternalLink,
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
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('document', uploadFile);
      if (uploadTitle) formData.append('title', uploadTitle);

      await patientService.uploadDocument(id, formData);
      setUploadTitle('');
      setUploadFile(null);
      await fetchHistory();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await patientService.deleteDocument(id, docId);
      await fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
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

  const { patient, appointments, medicalRecords, documents = [] } = history;

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
              { key: 'documents', label: 'Documents & Reports', icon: FileText, count: documents.length },
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

            {/* Documents & Reports Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {/* Upload Form */}
                <form onSubmit={handleFileUpload} className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Upload Medical Document / Report
                  </p>
                  {uploadError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">{uploadError}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Document Title / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Discharge Summary, X-Ray Chest, Blood Panel"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Select File (PDF, Images, Docs - max 15MB) *</label>
                      <input
                        type="file"
                        required
                        onChange={(e) => setUploadFile(e.target.files[0] || null)}
                        className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={uploading || !uploadFile}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                </form>

                {/* Documents List */}
                {documents.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No uploaded documents or reports for this patient.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{doc.title}</p>
                            <p className="text-xs text-slate-500">
                              Uploaded by {doc.uploaded_by_username || 'Staff'} • {new Date(doc.uploaded_at).toLocaleDateString()} • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-xs font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
