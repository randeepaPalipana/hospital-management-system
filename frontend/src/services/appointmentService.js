import api from './api';

export const appointmentService = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  updateStatus: (id, status, notes) => api.patch(`/appointments/${id}/status`, { status, notes }),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  getDoctorAvailability: (doctorId, date) =>
    api.get(`/appointments/doctor/${doctorId}/availability`, { params: { date } }),
};
