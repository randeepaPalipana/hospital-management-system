import React, { useState, useEffect } from 'react';
import { doctorService, departmentService } from '../../services/doctorService';
import { X, UserCheck, Loader2, AlertCircle } from 'lucide-react';

const DoctorFormModal = ({ doctor, onClose, onSuccess }) => {
  const isEdit = !!doctor;
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    first_name: doctor?.first_name || '',
    last_name: doctor?.last_name || '',
    gender: doctor?.gender || 'Male',
    department_id: doctor?.department_id || '',
    specialization: doctor?.specialization || '',
    license_number: doctor?.license_number || '',
    phone: doctor?.phone || '',
    email: doctor?.email || '',
    consultation_fee: doctor?.consultation_fee || '',
    room_number: doctor?.room_number || '',
    biography: doctor?.biography || '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    departmentService.getAll().then((res) => {
      setDepartments(res.data.data || []);
      if (!isEdit && res.data.data?.length > 0 && !form.department_id) {
        setForm((f) => ({ ...f, department_id: res.data.data[0].id }));
      }
    });
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
        consultation_fee: parseFloat(form.consultation_fee) || 0,
      };
      if (isEdit) {
        await doctorService.update(doctor.id, payload);
      } else {
        await doctorService.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? `Edit Doctor — Dr. ${doctor.first_name} ${doctor.last_name}` : 'Register New Doctor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Physician Bio</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input type="text" required name="first_name" value={form.first_name} onChange={handleChange}
                placeholder="Arthur" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input type="text" required name="last_name" value={form.last_name} onChange={handleChange}
                placeholder="Conan" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department *</label>
              <select required name="department_id" value={form.department_id} onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Clinical Credentials</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
              <input type="text" required name="specialization" value={form.specialization} onChange={handleChange}
                placeholder="e.g. Cardiologist" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">License Number *</label>
              <input type="text" required disabled={isEdit} name="license_number" value={form.license_number} onChange={handleChange}
                placeholder="e.g. MD-SLMC-2015-8821" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (Rs.)</label>
              <input type="number" step="0.01" min="0" name="consultation_fee" value={form.consultation_fee} onChange={handleChange}
                placeholder="2500.00" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Office Number</label>
              <input type="text" name="room_number" value={form.room_number} onChange={handleChange}
                placeholder="OPD-102" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Contact Details</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
              <input type="text" required name="phone" value={form.phone} onChange={handleChange}
                placeholder="+94 77 000 0000" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input type="email" required name="email" value={form.email} onChange={handleChange}
                placeholder="doctor@hospital.com" className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Biography / Notes</label>
            <textarea rows={2} name="biography" value={form.biography} onChange={handleChange}
              placeholder="Qualifications, fellowships, clinic background..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorFormModal;
