import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Failed to authenticate. Please check your credentials or server status.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
    setError('');
  };

  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="min-h-screen bg-[#0275d8] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
      {/* Outer Card with Rounded Corners & Subtle Shadow */}
      <div className="w-full max-w-4xl bg-white rounded-3xl md:rounded-[36px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px] relative">
        
        {/* LEFT COLUMN: Blue branded banner with 3D spherical bubble graphics */}
        <div className="md:w-1/2 bg-gradient-to-br from-[#0066eb] to-[#0052cc] text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative 3D Spheres / Circles */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#1e88e5] to-[#0050c8] opacity-80 pointer-events-none" />
          <div className="absolute top-1/4 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#2196f3] to-[#0d47a1] opacity-75 shadow-lg pointer-events-none" />
          <div className="absolute -bottom-16 left-6 w-56 h-56 rounded-full bg-gradient-to-tr from-[#0275d8] to-[#1565c0] shadow-xl pointer-events-none" />
          <div className="absolute bottom-10 -right-6 w-32 h-32 rounded-full bg-gradient-to-tr from-[#1976d2] to-[#0d47a1] opacity-60 pointer-events-none" />

          {/* Foreground Text Content */}
          <div className="relative z-10 max-w-sm space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4 text-sky-200" />
              <span>MediCare HMS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white uppercase">
              Welcome
            </h1>
            <p className="text-sm font-semibold tracking-wide text-sky-100 uppercase">
              Hospital Management System
            </p>
            <p className="text-xs text-sky-100/90 leading-relaxed pt-2 font-normal">
              Unified operational portal for clinical appointments, electronic health records, pharmacy dispensary, pathology laboratory, and billing cashier workstations.
            </p>

            <div className="pt-4 flex items-center gap-3 text-xs text-sky-200/80">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sri Lanka Clinical Network • v2.0 Online</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: White Form Panel */}
        <div className="md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center relative">
          {/* Decorative Corner Sphere */}
          <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-tl from-[#0275d8] to-[#1e88e5] pointer-events-none opacity-90 hidden md:block" />

          <div className="w-full max-w-sm mx-auto relative z-10">
            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your hospital credentials to access your clinical workstation
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="User Name"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f3f4f6] hover:bg-[#eaecef] border-0 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87] transition-all"
                />
              </div>

              {/* Password Input with SHOW toggle */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-11 pr-16 py-3 bg-[#f3f4f6] hover:bg-[#eaecef] border-0 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[11px] font-bold tracking-wider text-slate-500 hover:text-slate-800 uppercase"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0a4b78] border-slate-300 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#help"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact Hospital IT Systems Administrator to reset internal workstation credentials.');
                  }}
                  className="text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0a446c] hover:bg-[#073554] text-white font-bold text-sm tracking-wide shadow-md transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* Or separator */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-xs">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Secondary Button ("Sign in with other") */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@123456')}
                className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs tracking-wide transition-colors flex items-center justify-center cursor-pointer"
              >
                Sign in with other (Demo Admin)
              </button>
            </form>

            {/* Quick Seed Credentials Assistant (Role Chips) */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Role Autofill (Sri Lanka Seed Roster)
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'Admin@123456')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 font-medium transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('doc_senarathne', 'Doctor@123456')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 font-medium transition-colors"
                >
                  Dr. Senarathne
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('nurse_silva', 'Nurse@123456')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 font-medium transition-colors"
                >
                  Nurse Silva
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('pharm_perera', 'Pharm@123456')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 font-medium transition-colors"
                >
                  Pharmacist
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('cashier_fernando', 'Cashier@123456')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 font-medium transition-colors"
                >
                  Cashier
                </button>
              </div>
            </div>

            {/* Bottom Account Line */}
            <p className="text-center text-xs text-slate-400 mt-5">
              Authorized personnel only • <span className="text-sky-700 font-semibold cursor-pointer" onClick={() => handleQuickFill('admin', 'Admin@123456')}>Staff Support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
