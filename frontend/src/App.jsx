import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Placeholders for upcoming Phase modules */}
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="doctors/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Doctor Management Module (Phase 9)</h2></div>} />
            <Route path="appointments/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Appointment Scheduling (Phase 10)</h2></div>} />
            <Route path="medical-records/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Electronic Medical Records (Phase 11)</h2></div>} />
            <Route path="laboratory/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Laboratory Diagnostics (Phase 12)</h2></div>} />
            <Route path="pharmacy/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Pharmacy & Drug Inventory (Phase 13)</h2></div>} />
            <Route path="billing/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Billing & Invoices (Phase 14)</h2></div>} />
            <Route path="staff/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Staff & HR Management (Phase 15)</h2></div>} />
            <Route path="reports/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">Reports & Analytics (Phase 16)</h2></div>} />
            <Route path="users/*" element={<div className="p-4 bg-white rounded-xl border border-slate-200"><h2 className="text-xl font-bold">System User Security (Admin)</h2></div>} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
