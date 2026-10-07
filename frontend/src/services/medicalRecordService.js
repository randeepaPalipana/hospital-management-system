import api from './api';

export const medicalRecordService = {
  getAll: (params = {}) => api.get('/medical-records', { params }),
  getById: (id) => api.get(`/medical-records/${id}`),
  create: (data) => api.post('/medical-records', data),
  getMedicines: () => api.get('/medical-records/medicines'),
  getPrescription: (id) => api.get(`/medical-records/prescriptions/${id}`),
  updatePrescriptionStatus: (id, status) =>
    api.patch(`/medical-records/prescriptions/${id}/status`, { status }),
};
