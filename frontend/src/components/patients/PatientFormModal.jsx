import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { X, User, Loader2, AlertCircle } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const EMPTY_FORM = {
  first_name: '', last_name: '', dob: '', gender: 'Male', blood_group: 'Unknown',
  phone: '', email: '', address: '',
  emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
  allergies: '',
};

const PatientFormModal = ({ patient, onClose, onSuccess }) => {
  const isEdit = !!patient;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        dob: patient.dob ? patient.dob.substring(0, 10) : '',
        gender: patient.gender || 'Male',
        blood_group: patient.blood_group || 'Unknown',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relation: patient.emergency_contact_relation || '',
        allergies: patient.allergies || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors([]);
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEdit) {
        await patientService.update(patient.id, form);
      } else {
        await patientService.create(form);
      }
      onSuccess();
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        setErrors(serverErrors);
      } else {
        setErrors([{ field: 'general', message: err.response?.data?.message || 'An error occurred' }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErr = (name) => errors.find((e) => e.field === name)?.message;

  const Input = ({ label, name, type = 'text', required, placeholder, half }) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all ${fieldErr(name) ? 'border-rose-400' : 'border-slate-300'}`}
      />
      {fieldErr(name) && <p className="text-xs text-rose-600 mt-1">{fieldErr(name)}</p>}
    </div>
  );

  const generalErr = errors.find((e) => e.field === 'general');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? `Edit Patient — ${patient.mrn}` : 'Register New Patient'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          {generalErr && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {generalErr.message}
            </div>
          )}

          {/* Personal Info */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Personal Information</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Input label="First Name" name="first_name" required half placeholder="e.g. Sarah" />
            <Input label="Last Name" name="last_name" required half placeholder="e.g. Johnson" />
            <Input label="Date of Birth" name="dob" type="date" required half />
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender <span className="text-rose-500">*</span></label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select name="blood_group" value={form.blood_group} onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <Input label="Allergies" name="allergies" half placeholder="e.g. Penicillin, Latex" />
          </div>

          {/* Contact */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Contact Information</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Input label="Phone Number" name="phone" required half placeholder="+1 555 000 0000" />
            <Input label="Email Address" name="email" type="email" half placeholder="patient@email.com" />
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={2}
                placeholder="Full residential address..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
            </div>
          </div>

          {/* Emergency Contact */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Emergency Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Name" name="emergency_contact_name" half placeholder="e.g. Tom Johnson" />
            <Input label="Relationship" name="emergency_contact_relation" half placeholder="e.g. Spouse, Parent" />
            <Input label="Contact Phone" name="emergency_contact_phone" half placeholder="+1 555 000 0000" />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-60">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Patient'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFormModal;
