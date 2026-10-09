import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { formatLKR } from '../utils/currencyFormatter';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, DollarSign, FlaskConical, Pill, HeartPulse,
  TrendingUp, Clock, ShieldCheck, ArrowRight, RefreshCw, AlertCircle,
  Activity, CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchKPIs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getExecutiveSummary();
      setSummary(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Workstation Context */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Live Clinical Workstation • Shift Status Active
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hospital Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as <span className="font-semibold text-slate-700">{user?.employee_name || user?.username}</span> ({user?.role_name}) • Sri Lanka Health Services Network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchKPIs}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
          <div className="hidden sm:block text-right border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400 block font-medium">Core Services</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Online
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Clinical & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Patients */}
        <Link
          to="/patients"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients Registered</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {loading ? '—' : summary?.patients?.total_patients || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-sky-700 font-mono">+{summary?.patients?.registered_today || 0}</span>
              <span>new intakes today</span>
            </div>
          </div>
        </Link>

        {/* Today's Appointments */}
        <Link
          to="/appointments"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {loading ? '—' : summary?.appointments?.appointments_today || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-sky-700 font-mono">{summary?.appointments?.scheduled_count || 0}</span>
              <span>scheduled in queue</span>
            </div>
          </div>
        </Link>

        {/* Laboratory Queue */}
        <Link
          to="/laboratory"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnostic Lab Orders</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {loading ? '—' : summary?.laboratory?.total_lab_orders || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-amber-700 font-mono">{summary?.laboratory?.pending_collection || 0}</span>
              <span>pending specimen draw</span>
            </div>
          </div>
        </Link>

        {/* Pharmacy Batches */}
        <Link
          to="/pharmacy"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacy Expiry / Stock</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {loading ? '—' : summary?.pharmacy?.low_stock_batches || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-rose-700 font-mono">{summary?.pharmacy?.expiring_soon_batches || 0}</span>
              <span>batches expiring &lt;60 days</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Operational Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Snapshot */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Revenue Collections</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Paid Collections</span>
              <span className="text-lg font-bold font-mono text-emerald-800">
                {loading ? '—' : formatLKR(summary?.revenue?.total_collected)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Billed:</span>
              <span className="font-mono font-medium text-slate-700">
                {loading ? '—' : formatLKR(summary?.revenue?.total_billed)}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Duty Roster Today</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-[11px] text-slate-500 block">Active Staff on Duty</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {loading ? '—' : `${summary?.staff?.present_today || 0} / ${summary?.staff?.active_staff || 0}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Approved Leave:</span>
              <span className="font-mono font-medium text-slate-700">
                {summary?.staff?.on_leave_today || 0} personnel
              </span>
            </div>
          </div>
        </div>

        {/* Formulary Stock */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Formulary Formulary</span>
            <HeartPulse className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-[11px] text-slate-500 block">Cataloged Medications</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {loading ? '—' : `${summary?.pharmacy?.total_medicines || 0} Formulary Items`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Units in Stock:</span>
              <span className="font-mono font-medium text-slate-700">
                {loading ? '—' : Number(summary?.pharmacy?.total_units_in_stock || 0).toLocaleString()} units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Module Access Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Clinical & Departmental Desks</h2>
            <p className="text-xs text-slate-500">Direct navigation for fast hospital workstation routines</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1"
          >
            <span>Analytics Suite</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/patients"
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition text-center group"
          >
            <Users className="w-4 h-4 text-slate-600 group-hover:text-sky-700 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-800 block">Patients</span>
          </Link>

          <Link
            to="/appointments"
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition text-center group"
          >
            <Calendar className="w-4 h-4 text-slate-600 group-hover:text-sky-700 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-800 block">Appointments</span>
          </Link>

          <Link
            to="/medical-records"
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition text-center group"
          >
            <Activity className="w-4 h-4 text-slate-600 group-hover:text-sky-700 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-800 block">EMR Records</span>
          </Link>

          <Link
            to="/laboratory"
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition text-center group"
          >
            <FlaskConical className="w-4 h-4 text-slate-600 group-hover:text-sky-700 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-800 block">Laboratory</span>
          </Link>

          <Link
            to="/pharmacy"
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition text-center group"
          >
            <Pill className="w-4 h-4 text-slate-600 group-hover:text-sky-700 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-800 block">Pharmacy</span>
          </Link>

          <Link
            to="/billing"
            className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition text-center group"
          >
            <DollarSign className="w-4 h-4 text-slate-600 group-hover:text-sky-700 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-800 block">Billing</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
