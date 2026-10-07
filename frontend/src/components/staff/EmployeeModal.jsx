import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/doctorService';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';

const EmployeeModal = ({ employee, onClose, onSuccess }) => {
  const isEdit = !!employee;
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    gender: employee?.gender || 'Male',
    department_id: employee?.department_id || '',
    designation: employee?.designation || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    hire_date: employee?.hire_date ? employee.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
    salary: employee?.salary || '',
    status: employee?.status || 'active',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((res) => {
      const list = res.data.data || [];
      setDepartments(list);
      if (!isEdit && list.length > 0 && !form.department_id) {
        setForm((f) => ({ ...f, department_id: list[0].id }));
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        department_id: parseInt(form.department_id, 10),
        salary: parseFloat(form.salary) || 0,
      };

      if (isEdit) {
        await staffService.updateEmployee(employee.id, payload);
      } else {
        await staffService.createEmployee(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? `Edit Staff Member (${employee.employee_code})` : 'Register New Staff Member'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                required
                value={form.first_name}
                onChange={handleChange}
                placeholder="e.g. Sarah"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                required
                value={form.last_name}
                onChange={handleChange}
                placeholder="e.g. Jenkins"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department_id"
                required
                value={form.department_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                required
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Head Nurse, Lab Tech"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="0712345678"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="sarah.jenkins@hospital.org"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Hire Date</label>
              <input
                type="date"
                name="hire_date"
                value={form.hire_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Salary ($/mo)</label>
              <input
                type="number"
                name="salary"
                min="0"
                step="0.01"
                value={form.salary}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Employment Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
