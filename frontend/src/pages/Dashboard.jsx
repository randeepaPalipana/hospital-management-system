import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-sky-600/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold backdrop-blur-xs mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Operational Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {user?.employee_name || user?.username}!
            </h1>
            <p className="text-sky-100 text-sm mt-1 max-w-xl">
              You are signed in as an authorized <span className="font-semibold underline underline-offset-2">{user?.role_name}</span>. Real-time patient flow, appointments, pharmacy, and diagnostic queues are synchronized.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchKPIs}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xs rounded-xl border border-white/20 text-white transition"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-center">
              <span className="block text-2xl font-bold font-mono">100%</span>
              <span className="text-[11px] text-sky-200 font-medium">System Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Live Synchronized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Patients */}
        <Link
          to="/patients"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : summary?.patients?.total_patients || 0}
            </p>
            <p className="text-xs text-sky-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{summary?.patients?.registered_today || 0} registered today
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Link>

        {/* Today's Appointments */}
        <Link
          to="/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : summary?.appointments?.appointments_today || 0}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {summary?.appointments?.scheduled_count || 0} active in queue
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </Link>

        {/* Laboratory Requisitions */}
        <Link
          to="/laboratory"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab Requisitions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : summary?.laboratory?.total_lab_orders || 0}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              {summary?.laboratory?.pending_collection || 0} pending phlebotomy
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
        </Link>

        {/* Pharmacy Stock Alert */}
        <Link
          to="/pharmacy"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacy Stock Alert</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : summary?.pharmacy?.low_stock_batches || 0}
            </p>
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <Pill className="w-3 h-3" />
              {summary?.pharmacy?.expiring_soon_batches || 0} expiring &lt;60d
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Secondary Operational Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Collected</p>
            <p className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ${loading ? '...' : Number(summary?.revenue?.total_collected || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Billed: ${Number(summary?.revenue?.total_billed || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Attendance Today</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {loading ? '...' : summary?.staff?.present_today || 0} present
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              {summary?.staff?.on_leave_today || 0} approved leaves
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Formulary Medicines</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {loading ? '...' : summary?.pharmacy?.total_medicines || 0} cataloged
            </p>
            <p className="text-xs text-teal-600 mt-1">
              {summary?.pharmacy?.total_units_in_stock || 0} total units in stock
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Launch & Operational Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hospital Operational Hub</h2>
            <p className="text-sm text-slate-500">
              Direct access to all 16 clinical and administrative sub-modules.
            </p>
          </div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            <span>View Full Analytics Suite</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/patients"
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-200 transition text-center group"
          >
            <Users className="w-5 h-5 text-slate-600 group-hover:text-teal-600 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 block">Patients</span>
          </Link>

          <Link
            to="/appointments"
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-200 transition text-center group"
          >
            <Calendar className="w-5 h-5 text-slate-600 group-hover:text-teal-600 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 block">Appointments</span>
          </Link>

          <Link
            to="/medical-records"
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-200 transition text-center group"
          >
            <Activity className="w-5 h-5 text-slate-600 group-hover:text-teal-600 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 block">EMR & Vitals</span>
          </Link>

          <Link
            to="/laboratory"
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-200 transition text-center group"
          >
            <FlaskConical className="w-5 h-5 text-slate-600 group-hover:text-teal-600 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 block">Laboratory</span>
          </Link>

          <Link
            to="/pharmacy"
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-200 transition text-center group"
          >
            <Pill className="w-5 h-5 text-slate-600 group-hover:text-teal-600 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 block">Pharmacy</span>
          </Link>

          <Link
            to="/billing"
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-200 transition text-center group"
          >
            <DollarSign className="w-5 h-5 text-slate-600 group-hover:text-teal-600 mx-auto mb-1.5" />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 block">Billing</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
