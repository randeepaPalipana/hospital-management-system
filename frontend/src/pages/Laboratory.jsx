import React, { useState, useEffect } from 'react';
import { laboratoryService } from '../services/laboratoryService';
import { formatLKR } from '../utils/currencyFormatter';
import { useAuth } from '../context/AuthContext';
import {
  TestTube, Plus, Search, Filter, CheckCircle2,
  AlertTriangle, Clock, RefreshCw, FileText, Printer, Eye,
} from 'lucide-react';
import LabOrderModal from '../components/laboratory/LabOrderModal';
import ResultEntryModal from '../components/laboratory/ResultEntryModal';

const STATUS_BADGES = {
  ordered: { label: 'Ordered', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  sample_collected: { label: 'Sample Collected', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_process: { label: 'In Process', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const Laboratory = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'catalog'

  // Requests state
  const [requests, setRequests] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [resultRequest, setResultRequest] = useState(null);
  const [printRequest, setPrintRequest] = useState(null);

  const isLabStaffOrAdmin = hasRole('Administrator') || hasRole('Laboratory Staff');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, testRes] = await Promise.all([
        laboratoryService.getRequests({
          status: selectedStatus || undefined,
        }),
        laboratoryService.getTests(),
      ]);
      setRequests(reqRes.data.data || []);
      setTests(testRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load laboratory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await laboratoryService.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update requisition status');
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Laboratory Diagnostics & Pathology
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              Pathology Services
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specimen accessioning, clinical biochemistry & hematology findings, validation, and pathology reporting.
          </p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0275d8] to-[#0052cc] hover:from-[#0066eb] hover:to-[#0047b3] text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Order Lab Requisition
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/90 text-xs font-medium">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'requests'
              ? 'border-[#0275d8] text-[#0275d8] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TestTube className="w-3.5 h-3.5" />
          Active Requisitions ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-[#0275d8] text-[#0275d8] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Diagnostic Formulary ({tests.length})
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>
      )}

      {/* TAB 1: REQUISITIONS QUEUE */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 flex flex-wrap gap-2.5 items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Requisition Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Requisitions</option>
                <option value="ordered">Ordered</option>
                <option value="sample_collected">Sample Collected</option>
                <option value="in_process">In Process</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              onClick={fetchData}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Accession / Date</th>
                    <th className="px-4 py-2.5 text-left">Patient Details</th>
                    <th className="px-4 py-2.5 text-left">Test & Specimen</th>
                    <th className="px-4 py-2.5 text-left">Ordering Physician</th>
                    <th className="px-4 py-2.5 text-left">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-3.5 bg-slate-100 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        <TestTube className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                        <p className="font-semibold text-slate-700 text-sm">No Laboratory Requisitions Found</p>
                        <p className="text-xs text-slate-400 mt-1">Order tests to populate the specimen queue.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => {
                      const badge = STATUS_BADGES[req.status] || STATUS_BADGES.ordered;
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                              LAB-{String(req.id).padStart(5, '0')}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-1">
                              {new Date(req.ordered_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 leading-tight">
                              {req.patient_first_name} {req.patient_last_name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {req.patient_mrn} • <span className="font-medium text-rose-700">{req.blood_group}</span>
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{req.test_name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {req.sample_type} <span className="text-slate-300">|</span> {req.test_category}
                            </p>
                            {req.result_value && (
                              <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-200/80 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  {req.is_abnormal ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded border border-rose-200">ABNORMAL</span>
                                  ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">NORMAL</span>
                                  )}
                                  <span className="font-mono font-semibold text-slate-900">{req.result_value}</span>
                                </div>
                                {req.remarks && <p className="text-[11px] text-slate-500 italic mt-0.5">{req.remarks}</p>}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">Dr. {req.doctor_name}</p>
                            <p className="text-[11px] text-slate-500">{req.doctor_specialization}</p>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Workflow Actions */}
                              {req.status === 'ordered' && isLabStaffOrAdmin && (
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'sample_collected')}
                                  className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
                                >
                                  Collect Sample
                                </button>
                              )}

                              {req.status === 'sample_collected' && isLabStaffOrAdmin && (
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'in_process')}
                                  className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium hover:bg-indigo-100 transition-colors"
                                >
                                  Start Analysis
                                </button>
                              )}

                              {(req.status === 'in_process' || req.status === 'sample_collected') && isLabStaffOrAdmin && (
                                <button
                                  onClick={() => setResultRequest(req)}
                                  className="px-2.5 py-1 rounded bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors"
                                >
                                  Enter Findings
                                </button>
                              )}

                              {req.status === 'completed' && (
                                <button
                                  onClick={() => window.print()}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                                  title="Print Diagnostic Report"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
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
        </div>
      )}

      {/* TAB 2: TEST CATALOG */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Test Code</th>
                <th className="px-4 py-2.5 text-left">Diagnostic Investigation</th>
                <th className="px-4 py-2.5 text-left">Clinical Discipline</th>
                <th className="px-4 py-2.5 text-left">Biological Reference Interval</th>
                <th className="px-4 py-2.5 text-right">Standard Tariff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {t.test_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.category}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                    {t.reference_range ? `${t.reference_range} ${t.unit || ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {formatLKR(t.standard_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showOrderModal && (
        <LabOrderModal
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false);
            fetchData();
          }}
        />
      )}

      {resultRequest && (
        <ResultEntryModal
          request={resultRequest}
          onClose={() => setResultRequest(null)}
          onSuccess={() => {
            setResultRequest(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Laboratory;
