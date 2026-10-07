import api from './api';

export const pharmacyService = {
  // Medicines & Formulary
  getMedicines: (params = {}) => api.get('/pharmacy/medicines', { params }),
  getMedicineById: (id) => api.get(`/pharmacy/medicines/${id}`),
  createMedicine: (data) => api.post('/pharmacy/medicines', data),
  updateMedicine: (id, data) => api.put(`/pharmacy/medicines/${id}`, data),

  // Stock Inflow & Batches
  addBatch: (medicineId, data) => api.post(`/pharmacy/medicines/${medicineId}/batches`, data),
  getExpiringBatches: (days = 90) => api.get('/pharmacy/expiring-batches', { params: { days } }),

  // Prescriptions Dispensing Queue
  getPrescriptions: (params = {}) => api.get('/pharmacy/prescriptions', { params }),
  getPrescriptionDetail: (id) => api.get(`/pharmacy/prescriptions/${id}`),
  dispense: (id) => api.post(`/pharmacy/prescriptions/${id}/dispense`),
};
