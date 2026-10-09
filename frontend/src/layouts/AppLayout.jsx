import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  Receipt,
  UserCog,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  Clock,
  Activity,
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant'],
    },
    {
      label: 'Patients',
      path: '/patients',
      icon: Users,
      roles: ['Administrator', 'Receptionist', 'Doctor', 'Nurse'],
    },
    {
      label: 'Doctors',
      path: '/doctors',
      icon: UserCheck,
      roles: ['Administrator', 'Receptionist', 'Doctor'],
    },
    {
      label: 'Appointments',
      path: '/appointments',
      icon: Calendar,
      roles: ['Administrator', 'Receptionist', 'Doctor', 'Nurse'],
    },
    {
      label: 'Medical Records',
      path: '/medical-records',
      icon: FileText,
      roles: ['Administrator', 'Doctor', 'Nurse'],
    },
    {
      label: 'Laboratory',
      path: '/laboratory',
      icon: FlaskConical,
      roles: ['Administrator', 'Laboratory Staff', 'Doctor'],
    },
    {
      label: 'Pharmacy',
      path: '/pharmacy',
      icon: Pill,
      roles: ['Administrator', 'Pharmacist', 'Doctor'],
    },
    {
      label: 'Billing & Invoices',
      path: '/billing',
      icon: Receipt,
      roles: ['Administrator', 'Accountant', 'Receptionist'],
    },
    {
      label: 'Staff & HR',
      path: '/staff',
      icon: UserCog,
      roles: ['Administrator'],
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: BarChart3,
      roles: ['Administrator', 'Accountant', 'Doctor'],
    },
    {
      label: 'System Users',
      path: '/users',
      icon: Shield,
      roles: ['Administrator'],
    },
  ];

  // Filter navigation items by current user's role
  const visibleNavItems = navItems.filter((item) =>
    item.roles.some((role) => user?.role_name === role)
  );

  const roleBadgeColors = {
    Administrator: 'bg-purple-100 text-purple-800 border-purple-200',
    Doctor: 'bg-sky-100 text-sky-800 border-sky-200',
    Nurse: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Receptionist: 'bg-pink-100 text-pink-800 border-pink-200',
    'Laboratory Staff': 'bg-amber-100 text-amber-800 border-amber-200',
    Pharmacist: 'bg-orange-100 text-orange-800 border-orange-200',
    Accountant: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 text-slate-200 transition-all duration-200 border-r border-slate-800 shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold flex-shrink-0 border border-sky-600/40">
              <Activity className="w-5 h-5 text-sky-200" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-100 tracking-tight leading-tight truncate">MediCare HMS</span>
                <span className="text-[11px] text-slate-400 font-medium tracking-normal truncate">General Hospital LK</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section Title */}
        {sidebarOpen && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinical & Administrative</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-2 px-2.5 space-y-0.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                    isActive
                      ? 'bg-sky-700/80 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } ${!sidebarOpen && 'justify-center px-0'}`
                }
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Mini Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.username}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.role_name}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-sky-400" />
                <span className="font-bold text-lg">MediCare HMS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm ${
                        isActive ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200/90 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-slate-400">Hospital Workstation</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 capitalize font-semibold tracking-tight">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/80 text-slate-600 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTime}</span>
            </div>

            {/* Role Badge */}
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                roleBadgeColors[user?.role_name] || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {user?.role_name || 'Staff'}
            </span>

            {/* User display */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <span className="text-slate-500">Active:</span>
              <span className="font-semibold text-slate-800">{user?.username}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50/80 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
