import api from './api';

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
};

export const doctorService = {
  getAll: (params = {}) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  getSchedules: (id) => api.get(`/doctors/${id}/schedules`),
  addSchedule: (id, data) => api.post(`/doctors/${id}/schedules`, data),
  deleteSchedule: (id, scheduleId) => api.delete(`/doctors/${id}/schedules/${scheduleId}`),
};
