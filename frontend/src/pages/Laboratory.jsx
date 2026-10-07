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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TestTube className="w-7 h-7 text-violet-600" />
            Laboratory Diagnostics & Pathology
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Specimen tracking, clinical analysis, diagnostic results entry, and report printing.
          </p>
        </div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-sm shadow-violet-600/20"
        >
          <Plus className="w-4 h-4" />
          Order Lab Requisition
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <TestTube className="w-4 h-4" />
          Requisitions Queue ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-violet-600 text-violet-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Test Catalog ({tests.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{error}</div>
      )}

      {/* TAB 1: REQUISITIONS QUEUE */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">ID & Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Test & Specimen</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Ordering Doctor</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <TestTube className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-slate-600">No laboratory requisitions found</p>
                        <p className="text-xs text-slate-400 mt-1">Order tests to populate the queue.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => {
                      const badge = STATUS_BADGES[req.status] || STATUS_BADGES.ordered;
                      return (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100 inline-block">
                              LAB-{String(req.id).padStart(5, '0')}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(req.ordered_at).toLocaleDateString()}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900 leading-tight">
                              {req.patient_first_name} {req.patient_last_name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{req.patient_mrn} • {req.blood_group}</p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{req.test_name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{req.sample_type} • {req.test_category}</p>
                            {req.result_value && (
                              <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                                <div className="flex items-center gap-1.5">
                                  {req.is_abnormal ? (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">ABNORMAL</span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">NORMAL</span>
                                  )}
                                  <span className="font-semibold text-slate-800">{req.result_value}</span>
                                </div>
                                {req.remarks && <p className="text-[11px] text-slate-500 italic mt-0.5">{req.remarks}</p>}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">Dr. {req.doctor_name}</p>
                            <p className="text-xs text-slate-500">{req.doctor_specialization}</p>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Workflow Actions */}
                              {req.status === 'ordered' && isLabStaffOrAdmin && (
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'sample_collected')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
                                >
                                  Collect Sample
                                </button>
                              )}

                              {req.status === 'sample_collected' && isLabStaffOrAdmin && (
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'in_process')}
                                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100"
                                >
                                  Start Process
                                </button>
                              )}

                              {(req.status === 'in_process' || req.status === 'sample_collected') && isLabStaffOrAdmin && (
                                <button
                                  onClick={() => setResultRequest(req)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                                >
                                  Enter Findings
                                </button>
                              )}

                              {req.status === 'completed' && (
                                <button
                                  onClick={() => window.print()}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                                  title="Print Diagnostic Report"
                                >
                                  <Printer className="w-4 h-4" />
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Test Code</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Test Name</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Reference Range</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Standard Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-violet-700">{t.test_code}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{t.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.category}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                    {t.reference_range ? `${t.reference_range} ${t.unit || ''}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-700">
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
