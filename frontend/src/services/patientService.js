import api from './api';

export const patientService = {
  getAll: (params = {}) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  uploadDocument: (id, formData) =>
    api.post(`/patients/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id, docId) => api.delete(`/patients/${id}/documents/${docId}`),
};
