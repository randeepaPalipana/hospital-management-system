import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../services/medicalRecordService';
import { patientService } from '../services/patientService';
import {
  FileText, Plus, Search, HeartPulse, Pill, Calendar,
  User, Eye, RefreshCw, Activity,
} from 'lucide-react';
import EncounterModal from '../components/emr/EncounterModal';
import PrescriptionModal from '../components/emr/PrescriptionModal';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await medicalRecordService.getAll({
        search: searchQuery || undefined,
      });
      setRecords(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenPrescription = async (prescriptionId) => {
    try {
      const res = await medicalRecordService.getPrescription(prescriptionId);
      setViewPrescription(res.data.data);
    } catch (err) {
      alert('Failed to load prescription');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-sky-600" />
            Electronic Medical Records (EMR)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Clinical consultations, patient vitals examination, diagnoses, and pharmaceutical prescriptions.
          </p>
        </div>
        <button
          onClick={() => setShowEncounterModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          Document Encounter
        </button>
      </div>

      {/* Filter Bar with Text Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by patient name or MRN (e.g. HOSP-2026-00001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <button
          onClick={fetchRecords}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          title="Refresh records"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{error}</div>
      )}

      {/* Encounter Cards Grid */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="font-semibold text-slate-600">No medical encounters documented</p>
          <p className="text-xs text-slate-400 mt-1">Start by recording a physician diagnosis and prescription.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow space-y-3"
            >
              {/* Encounter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    {rec.patient_first_name?.charAt(0)}{rec.patient_last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">
                      {rec.patient_first_name} {rec.patient_last_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {rec.patient_mrn} • {rec.patient_age} yrs, {rec.patient_gender} • Blood: {rec.blood_group}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-800 text-sm">Dr. {rec.doctor_name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(rec.encounter_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Vitals Ribbon */}
              {(rec.vitals_bp || rec.vitals_pulse || rec.vitals_temp_c) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {rec.vitals_bp && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      BP: <span className="font-bold font-mono">{rec.vitals_bp}</span>
                    </span>
                  )}
                  {rec.vitals_pulse && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium border border-rose-100">
                      Pulse: <span className="font-bold font-mono">{rec.vitals_pulse} bpm</span>
                    </span>
                  )}
                  {rec.vitals_temp_c && (
                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 font-medium border border-orange-100">
                      Temp: <span className="font-bold font-mono">{rec.vitals_temp_c}°C</span>
                    </span>
                  )}
                  {rec.vitals_spo2 && (
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-medium border border-sky-100">
                      SpO2: <span className="font-bold font-mono">{rec.vitals_spo2}%</span>
                    </span>
                  )}
                  {rec.vitals_weight_kg && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Weight: <span className="font-bold font-mono">{rec.vitals_weight_kg} kg</span>
                    </span>
                  )}
                </div>
              )}

              {/* Complaints & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Chief Complaint:</span>
                  <p className="text-slate-800 italic">"{rec.chief_complaint}"</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Diagnosis:</span>
                  <p className="font-bold text-slate-900">{rec.diagnosis}</p>
                </div>
              </div>

              {/* Treatment Advisory */}
              {rec.treatment_plan && (
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Treatment Plan: </span>
                  {rec.treatment_plan}
                </p>
              )}

              {/* Linked Prescription Action */}
              {rec.prescription_id && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5" />
                    Prescription RX-{String(rec.prescription_id).padStart(5, '0')} ({rec.prescription_status})
                  </span>
                  <button
                    onClick={() => handleOpenPrescription(rec.prescription_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View & Dispense Rx
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showEncounterModal && (
        <EncounterModal
          onClose={() => setShowEncounterModal(false)}
          onSuccess={() => {
            setShowEncounterModal(false);
            fetchRecords();
          }}
        />
      )}

      {viewPrescription && (
        <PrescriptionModal
          prescription={viewPrescription}
          onClose={() => setViewPrescription(null)}
          onRefresh={fetchRecords}
        />
      )}
    </div>
  );
};

export default MedicalRecords;
