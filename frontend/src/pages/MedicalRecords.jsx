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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Electronic Medical Records (EMR)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Clinical Encounters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultation histories, vital sign charting, diagnostic assessments, and linked pharmacy orders.
          </p>
        </div>
        <button
          onClick={() => setShowEncounterModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0275d8] to-[#0052cc] hover:from-[#0066eb] hover:to-[#0047b3] text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Document Encounter
        </button>
      </div>

      {/* Filter Bar with Text Box */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 flex flex-wrap gap-2.5 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search encounter by patient name or MRN (e.g. HOSP-2026-00001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0275d8] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <button
          onClick={fetchRecords}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Refresh records"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>
      )}

      {/* Encounter Cards Grid */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-xl border border-slate-200/90 animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-700 text-sm">No Medical Encounters Found</p>
          <p className="text-xs text-slate-400 mt-1">Start by recording a physician diagnosis and prescription.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
            >
              {/* Encounter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center border border-slate-200">
                    {rec.patient_first_name?.charAt(0)}{rec.patient_last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                      {rec.patient_first_name} {rec.patient_last_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {rec.patient_mrn} • {rec.patient_age}y, {rec.patient_gender} • <span className="font-semibold text-rose-700">{rec.blood_group}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-medium text-slate-800 text-xs">Attending: Dr. {rec.doctor_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(rec.encounter_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Vitals Observation Ribbon */}
              {(rec.vitals_bp || rec.vitals_pulse || rec.vitals_temp_c) && (
                <div className="flex flex-wrap gap-2 text-[11px] bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-medium self-center mr-1">Vitals:</span>
                  {rec.vitals_bp && (
                    <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-medium border border-slate-200">
                      BP <span className="font-bold font-mono text-slate-900">{rec.vitals_bp}</span> mmHg
                    </span>
                  )}
                  {rec.vitals_pulse && (
                    <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-medium border border-slate-200">
                      Pulse <span className="font-bold font-mono text-rose-700">{rec.vitals_pulse}</span> bpm
                    </span>
                  )}
                  {rec.vitals_temp_c && (
                    <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-medium border border-slate-200">
                      Temp <span className="font-bold font-mono text-amber-700">{rec.vitals_temp_c}°C</span>
                    </span>
                  )}
                  {rec.vitals_spo2 && (
                    <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-medium border border-slate-200">
                      SpO₂ <span className="font-bold font-mono text-sky-700">{rec.vitals_spo2}%</span>
                    </span>
                  )}
                  {rec.vitals_weight_kg && (
                    <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-medium border border-slate-200">
                      Weight <span className="font-bold font-mono text-slate-800">{rec.vitals_weight_kg} kg</span>
                    </span>
                  )}
                </div>
              )}

              {/* Complaints & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Chief Complaint</span>
                  <p className="text-slate-700 italic">"{rec.chief_complaint}"</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Clinical Diagnosis</span>
                  <p className="font-semibold text-slate-900">{rec.diagnosis}</p>
                </div>
              </div>

              {/* Treatment Advisory */}
              {rec.treatment_plan && (
                <div className="text-xs text-slate-600 bg-white px-1">
                  <span className="font-semibold text-slate-700">Treatment Plan: </span>
                  {rec.treatment_plan}
                </div>
              )}

              {/* Linked Prescription Action */}
              {rec.prescription_id && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    Prescription <span className="font-mono font-semibold">RX-{String(rec.prescription_id).padStart(5, '0')}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1">
                      {rec.prescription_status}
                    </span>
                  </span>
                  <button
                    onClick={() => handleOpenPrescription(rec.prescription_id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Review & Dispense
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
