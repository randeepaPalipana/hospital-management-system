import React, { useState, useEffect } from 'react';
import { staffService } from '../services/staffService';
import { departmentService } from '../services/doctorService';
import { useAuth } from '../context/AuthContext';
import {
  Users, CalendarCheck, CalendarDays, Plus, Search, Filter,
  CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Edit, Check
} from 'lucide-react';
import EmployeeModal from '../components/staff/EmployeeModal';
import AttendanceModal from '../components/staff/AttendanceModal';
import LeaveModal from '../components/staff/LeaveModal';

const STATUS_BADGES = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  on_leave: 'bg-amber-100 text-amber-800 border-amber-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  terminated: 'bg-rose-100 text-rose-800 border-rose-200',
};

const ATTENDANCE_BADGES = {
  present: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  absent: 'bg-rose-100 text-rose-800 border-rose-200',
  late: 'bg-amber-100 text-amber-800 border-amber-200',
  half_day: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  on_leave: 'bg-purple-100 text-purple-800 border-purple-200',
};

const Staff = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'attendance' | 'leaves'

  // Common filters
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Employees tab state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Attendance tab state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);

  // Leaves tab state
  const [leaves, setLeaves] = useState([]);
  const [leaveFilterStatus, setLeaveFilterStatus] = useState('');
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [decidingLeaveId, setDecidingLeaveId] = useState(null);

  const [error, setError] = useState('');

  useEffect(() => {
    departmentService.getAll().then((res) => {
      setDepartments(res.data.data || []);
    }).catch(console.error);
  }, []);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setError('');
    try {
      const res = await staffService.getEmployees({
        departmentId: selectedDept || undefined,
        search: searchQuery || undefined,
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees list');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch attendance
  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    setError('');
    try {
      const res = await staffService.getAttendance({
        date: attendanceDate,
        departmentId: selectedDept || undefined,
      });
      setRoster(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load daily attendance');
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch leaves
  const fetchLeaves = async () => {
    setLoadingLeaves(true);
    setError('');
    try {
      const res = await staffService.getLeaves({
        status: leaveFilterStatus || undefined,
      });
      setLeaves(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave records');
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'attendance') {
      fetchAttendance();
    } else if (activeTab === 'leaves') {
      fetchLeaves();
    }
  }, [activeTab, selectedDept, attendanceDate, leaveFilterStatus]);

  const handleLeaveDecision = async (id, status) => {
    const notes = prompt(`Enter optional remarks for ${status}:`) || '';
    setDecidingLeaveId(id);
    try {
      await staffService.decideLeave(id, { status, decision_notes: notes });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave request');
    } finally {
      setDecidingLeaveId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Human Resources</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage employee directories, daily staff attendance rosters, and leave approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'employees' && hasRole('Administrator') && (
            <button
              onClick={() => { setSelectedEmployee(null); setShowEmployeeModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          )}
          {activeTab === 'leaves' && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Apply Leave
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            activeTab === 'employees'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Directory ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            activeTab === 'attendance'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            activeTab === 'leaves'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Leave Requests ({leaves.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, designation, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchEmployees()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={fetchEmployees}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Search
              </button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={fetchEmployees}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingEmployees ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        Loading staff records...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No employees found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-medium text-xs text-teal-700">
                          {emp.employee_code}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {emp.first_name} {emp.last_name}
                          <div className="text-xs text-slate-400">{emp.gender}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{emp.department_name}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{emp.designation}</td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          <div>{emp.phone}</div>
                          <div className="text-slate-400">{emp.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${STATUS_BADGES[emp.status] || 'bg-slate-100 text-slate-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {hasRole('Administrator') && (
                            <button
                              onClick={() => { setSelectedEmployee(emp); setShowEmployeeModal(true); }}
                              className="p-1.5 text-slate-500 hover:text-teal-600 rounded-md hover:bg-slate-100"
                              title="Edit Employee"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600 uppercase">Roster Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={fetchAttendance}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingAttendance ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400">
                        Loading daily attendance roster...
                      </td>
                    </tr>
                  ) : roster.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-slate-400">
                        No active employees scheduled.
                      </td>
                    </tr>
                  ) : (
                    roster.map((row) => (
                      <tr key={row.employee_id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-medium text-xs text-teal-700">
                          {row.employee_code}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {row.first_name} {row.last_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.department_name}</td>
                        <td className="py-3 px-4 text-slate-600">{row.designation}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                          {row.clock_in ? row.clock_in.substring(0, 5) : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                          {row.clock_out ? row.clock_out.substring(0, 5) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${ATTENDANCE_BADGES[row.attendance_status] || 'bg-slate-100 text-slate-700'}`}>
                            {row.attendance_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">
                          {row.remarks || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedAttendanceRecord(row)}
                            className="px-2.5 py-1 text-xs font-medium text-teal-600 border border-teal-200 hover:bg-teal-50 rounded-lg transition"
                          >
                            Mark / Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE APPLICATIONS */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={leaveFilterStatus}
                onChange={(e) => setLeaveFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={fetchLeaves}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingLeaves ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        Loading leave requests...
                      </td>
                    </tr>
                  ) : leaves.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No leave records found.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((lv) => (
                      <tr key={lv.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {lv.first_name} {lv.last_name}
                          <div className="text-xs text-teal-700 font-mono">{lv.employee_code}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{lv.department_name}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 uppercase text-xs">
                          {lv.leave_type}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                          {lv.start_date.split('T')[0]} → {lv.end_date.split('T')[0]}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {lv.days_count} day{lv.days_count > 1 ? 's' : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs max-w-xs">
                          {lv.reason}
                          {lv.decision_notes && (
                            <div className="text-slate-400 italic mt-0.5">Note: {lv.decision_notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                              lv.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : lv.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {lv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {lv.status === 'pending' && hasRole('Administrator') ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleLeaveDecision(lv.id, 'approved')}
                                disabled={decidingLeaveId === lv.id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md border border-emerald-200"
                                title="Approve Request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleLeaveDecision(lv.id, 'rejected')}
                                disabled={decidingLeaveId === lv.id}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200"
                                title="Reject Request"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showEmployeeModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setShowEmployeeModal(false)}
          onSuccess={() => {
            setShowEmployeeModal(false);
            fetchEmployees();
          }}
        />
      )}

      {selectedAttendanceRecord && (
        <AttendanceModal
          record={selectedAttendanceRecord}
          date={attendanceDate}
          onClose={() => setSelectedAttendanceRecord(null)}
          onSuccess={() => {
            setSelectedAttendanceRecord(null);
            fetchAttendance();
          }}
        />
      )}

      {showLeaveModal && (
        <LeaveModal
          employees={employees}
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            setShowLeaveModal(false);
            fetchLeaves();
          }}
        />
      )}
    </div>
  );
};

export default Staff;
