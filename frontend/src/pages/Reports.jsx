import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, DollarSign, Users, Calendar, FlaskConical, Pill,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, Filter, FileText, PieChart
} from 'lucide-react';

const Reports = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'financial' | 'patients' | 'clinical' | 'pharmacy'

  // Summary state
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Financial state
  const [financialData, setFinancialData] = useState(null);
  const [financialDates, setFinancialDates] = useState({ startDate: '', endDate: '' });
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  // Patients state
  const [patientData, setPatientData] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Lab & Appointments state
  const [labData, setLabData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [loadingClinical, setLoadingClinical] = useState(false);

  // Pharmacy state
  const [pharmacyData, setPharmacyData] = useState(null);
  const [loadingPharmacy, setLoadingPharmacy] = useState(false);

  const [error, setError] = useState('');

  // Fetch functions
  const fetchSummary = async () => {
    setLoadingSummary(true);
    setError('');
    try {
      const res = await reportService.getExecutiveSummary();
      setSummaryData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load executive summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchFinancial = async () => {
    setLoadingFinancial(true);
    setError('');
    try {
      const res = await reportService.getFinancialReport({
        startDate: financialDates.startDate || undefined,
        endDate: financialDates.endDate || undefined,
      });
      setFinancialData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load financial report');
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setError('');
    try {
      const res = await reportService.getPatientReport();
      setPatientData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient demographics');
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchClinical = async () => {
    setLoadingClinical(true);
    setError('');
    try {
      const [labRes, apptRes] = await Promise.all([
        reportService.getLaboratoryReport(),
        reportService.getAppointmentsReport(),
      ]);
      setLabData(labRes.data.data);
      setAppointmentData(apptRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clinical analytics');
    } finally {
      setLoadingClinical(false);
    }
  };

  const fetchPharmacy = async () => {
    setLoadingPharmacy(true);
    setError('');
    try {
      const res = await reportService.getPharmacyReport();
      setPharmacyData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacy analytics');
    } finally {
      setLoadingPharmacy(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'summary') fetchSummary();
    if (activeTab === 'financial') fetchFinancial();
    if (activeTab === 'patients') fetchPatients();
    if (activeTab === 'clinical') fetchClinical();
    if (activeTab === 'pharmacy') fetchPharmacy();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Hospital Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time business intelligence across operational census, clinical performance, and revenue cycles.
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'summary') fetchSummary();
            if (activeTab === 'financial') fetchFinancial();
            if (activeTab === 'patients') fetchPatients();
            if (activeTab === 'clinical') fetchClinical();
            if (activeTab === 'pharmacy') fetchPharmacy();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh Metrics
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${
            activeTab === 'summary'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Executive Overview
        </button>

        {hasRole('Administrator', 'Cashier') && (
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${
              activeTab === 'financial'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financial & Invoicing
          </button>
        )}

        {hasRole('Administrator', 'Doctor', 'Nurse') && (
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${
              activeTab === 'patients'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Demographics & Census
          </button>
        )}

        {hasRole('Administrator', 'Doctor', 'Lab Technician', 'Receptionist') && (
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${
              activeTab === 'clinical'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Clinical & Lab Volumes
          </button>
        )}

        {hasRole('Administrator', 'Pharmacist') && (
          <button
            onClick={() => setActiveTab('pharmacy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${
              activeTab === 'pharmacy'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            Pharmacy & Formulary
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {loadingSummary ? (
            <div className="p-12 text-center text-slate-400">Loading hospital operational metrics...</div>
          ) : !summaryData ? null : (
            <>
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {summaryData.patients?.total_patients || 0}
                    </p>
                    <p className="text-xs text-teal-600 font-medium mt-1">
                      +{summaryData.patients?.registered_today || 0} registered today
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments Today</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {summaryData.appointments?.appointments_today || 0}
                    </p>
                    <p className="text-xs text-sky-600 font-medium mt-1">
                      {summaryData.appointments?.scheduled_count || 0} active in queue
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Collected</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      ${Number(summaryData.revenue?.total_collected || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-amber-600 font-medium mt-1">
                      ${Number(summaryData.revenue?.outstanding_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} balance due
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff Present</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {summaryData.staff?.present_today || 0} / {summaryData.staff?.active_staff || 0}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">
                      {summaryData.staff?.on_leave_today || 0} currently on leave
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Departmental Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Laboratory Operational Status */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-teal-600" />
                      Laboratory Diagnostics Queue
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Total Tests: {summaryData.laboratory?.total_lab_orders || 0}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="block text-xl font-bold text-amber-800">
                        {summaryData.laboratory?.pending_collection || 0}
                      </span>
                      <span className="text-xs text-amber-600 font-medium">Pending Phlebotomy</span>
                    </div>
                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                      <span className="block text-xl font-bold text-sky-800">
                        {summaryData.laboratory?.processing_samples || 0}
                      </span>
                      <span className="text-xs text-sky-600 font-medium">Under Analysis</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="block text-xl font-bold text-emerald-800">
                        {summaryData.laboratory?.completed_tests || 0}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">Results Verified</span>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Inventory Health */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-teal-600" />
                      Pharmacy Inventory Status
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Stock: {summaryData.pharmacy?.total_units_in_stock || 0} units
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-xl font-bold text-slate-800">
                        {summaryData.pharmacy?.total_medicines || 0}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">Formulary Drugs</span>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <span className="block text-xl font-bold text-rose-800">
                        {summaryData.pharmacy?.low_stock_batches || 0}
                      </span>
                      <span className="text-xs text-rose-600 font-medium">Low Stock Batches</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="block text-xl font-bold text-amber-800">
                        {summaryData.pharmacy?.expiring_soon_batches || 0}
                      </span>
                      <span className="text-xs text-amber-600 font-medium">Expiring &lt;60d</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: FINANCIAL & INVOICING */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Date range filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase">Payment Date Filter:</span>
            <input
              type="date"
              value={financialDates.startDate}
              onChange={(e) => setFinancialDates((f) => ({ ...f, startDate: e.target.value }))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={financialDates.endDate}
              onChange={(e) => setFinancialDates((f) => ({ ...f, endDate: e.target.value }))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={fetchFinancial}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition"
            >
              Apply Filter
            </button>
          </div>

          {loadingFinancial ? (
            <div className="p-12 text-center text-slate-400">Loading financial reports...</div>
          ) : !financialData ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Collections by Payment Channel
                </h3>
                <div className="space-y-3">
                  {financialData.paymentMethods.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4">No payments recorded in this period.</p>
                  ) : (
                    financialData.paymentMethods.map((pm, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <span className="font-semibold text-slate-800 text-sm capitalize">
                            {pm.payment_method.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500 block">{pm.count} transactions</span>
                        </div>
                        <span className="text-base font-bold text-emerald-700 font-mono">
                          ${Number(pm.total_amount).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Service Item Revenue Share */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Revenue Breakdown by Clinical Department
                </h3>
                <div className="space-y-3">
                  {financialData.serviceRevenue.map((sr, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm capitalize">
                          {sr.item_type} Services
                        </span>
                        <span className="text-xs text-slate-500 block">{sr.count} items billed</span>
                      </div>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        ${Number(sr.total_amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Receivables Status */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Invoicing Aging & Outstanding Receivables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {financialData.invoiceStatusBreakdown.map((inv, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {inv.status} Invoices ({inv.count})
                      </span>
                      <p className="text-xl font-bold text-slate-900 mt-1 font-mono">
                        Total: ${Number(inv.total_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-rose-600 font-medium mt-1">
                        Unpaid Balance: ${Number(inv.total_balance_due).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEMOGRAPHICS & CENSUS */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          {loadingPatients ? (
            <div className="p-12 text-center text-slate-400">Loading patient census...</div>
          ) : !patientData ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Demographics */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Patient Cohorts by Age Distribution
                </h3>
                <div className="space-y-3">
                  {patientData.ageDemographics.map((age, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-700">{age.age_group}</span>
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full font-bold text-xs">
                        {age.count} patients
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blood Group Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Blood Group Distribution
                </h3>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {patientData.bloodGroupDistribution.map((bg, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-lg font-bold text-rose-600">{bg.blood_group}</span>
                      <span className="text-xs text-slate-500">{bg.count} patients</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Diagnoses */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Most Frequent Clinical Diagnoses Recorded
                </h3>
                {patientData.topDiagnoses.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No diagnostic history logged yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {patientData.topDiagnoses.map((diag, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800">{diag.diagnosis}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {diag.occurrences} encounter{diag.occurrences > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLINICAL & LAB VOLUMES */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          {loadingClinical ? (
            <div className="p-12 text-center text-slate-400">Loading clinical reports...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Doctor Utilization */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Physician Consultations & Utilization
                </h3>
                <div className="space-y-3">
                  {appointmentData?.doctorUtilization?.map((doc, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900 text-sm block">{doc.doctor_name}</span>
                        <span className="text-xs text-slate-500">{doc.department_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-teal-700">{doc.total_appointments} total</span>
                        <span className="text-xs text-slate-500 block">
                          {doc.completed_count} completed • {doc.cancelled_count} cancelled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Test Demand & Abnormalities */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Diagnostic Testing Demand
                  </h3>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    {labData?.abnormalRates?.abnormal_percentage || 0}% Abnormal Rate
                  </span>
                </div>
                <div className="space-y-3">
                  {labData?.testVolumes?.map((test, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm block">{test.test_name}</span>
                        <span className="text-xs text-slate-500 capitalize">{test.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">{test.test_count} requests</span>
                        <span className="text-xs text-emerald-600 block">{test.completed_count} processed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PHARMACY & FORMULARY */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-6">
          {loadingPharmacy ? (
            <div className="p-12 text-center text-slate-400">Loading pharmacy data...</div>
          ) : !pharmacyData ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Prescribed */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Most Prescribed Medications
                </h3>
                {pharmacyData.topPrescribed.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No prescription trends available.</p>
                ) : (
                  <div className="space-y-3">
                    {pharmacyData.topPrescribed.map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="font-medium text-slate-800 text-sm">{med.medicine_name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-teal-700 font-mono">
                            {med.total_units_prescribed} units
                          </span>
                          <span className="text-xs text-slate-500 block">
                            {med.prescription_lines_count} prescriptions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiring Soon Batches */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  FEFO Expiry Horizon (&lt;90 Days)
                </h3>
                {pharmacyData.expiringBatches.length === 0 ? (
                  <p className="text-emerald-600 text-sm py-4 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> No batches expiring within the next 90 days.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pharmacyData.expiringBatches.map((bat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                        <div>
                          <span className="font-semibold text-slate-800 text-sm block">{bat.medicine_name}</span>
                          <span className="text-xs text-slate-500 font-mono">Batch: {bat.batch_number}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-800 block">
                            Expires in {bat.days_until_expiry} days
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Qty: {bat.quantity_available}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
