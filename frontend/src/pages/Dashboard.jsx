import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  DollarSign,
  FlaskConical,
  Pill,
  HeartPulse,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

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
              You are signed in as an authorized <span className="font-semibold underline underline-offset-2">{user?.role_name}</span>. Real-time patient flow, appointments, and diagnostic statuses are synchronized.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 text-center">
              <span className="block text-2xl font-bold font-mono">100%</span>
              <span className="text-[11px] text-sky-200 font-medium">System Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Placeholder Grid (Aligned with PDF §7 UI Dashboard specs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">--</p>
            <p className="text-xs text-sky-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Ready for intake
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">--</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Scheduled slots
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laboratory Requisitions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">--</p>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> Diagnostics queue
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacy Stock Alert</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">--</p>
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <Pill className="w-3 h-3" /> Monitored batches
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Module Navigation Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Hospital Operational Status</h2>
        <p className="text-sm text-slate-500 mb-6">
          The foundational architecture (Database, RBAC Security, Express REST API, and React Client Shell) is active. The upcoming development phases will connect each functional module to live backend endpoints.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Database Persisted
            </div>
            <p className="text-xs text-slate-500">23 Tables normalized in MySQL with foreign key constraints and audit logging.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              RBAC Guard Active
            </div>
            <p className="text-xs text-slate-500">Stateless JWT session handling with strict multi-role permission authorization.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              Frontend Scaled
            </div>
            <p className="text-xs text-slate-500">Vite React 18 SPA with Tailwind styling, dynamic role menus, and route guards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
