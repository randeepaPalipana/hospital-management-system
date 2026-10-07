import api from './api';

export const laboratoryService = {
  // Test Catalog
  getTests: (params = {}) => api.get('/laboratory/tests', { params }),
  createTest: (data) => api.post('/laboratory/tests', data),

  // Requests
  getRequests: (params = {}) => api.get('/laboratory/requests', { params }),
  getRequestById: (id) => api.get(`/laboratory/requests/${id}`),
  createRequest: (data) => api.post('/laboratory/requests', data),
  updateStatus: (id, status) => api.patch(`/laboratory/requests/${id}/status`, { status }),

  // Results Entry
  recordResult: (id, data) => api.post(`/laboratory/requests/${id}/results`, data),
};
