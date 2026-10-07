import api from './api';

export const staffService = {
  // Employees
  getEmployees: (params = {}) => api.get('/staff/employees', { params }),
  getEmployeeById: (id) => api.get(`/staff/employees/${id}`),
  createEmployee: (data) => api.post('/staff/employees', data),
  updateEmployee: (id, data) => api.put(`/staff/employees/${id}`, data),

  // Attendance
  getAttendance: (params = {}) => api.get('/staff/attendance', { params }),
  recordAttendance: (data) => api.post('/staff/attendance', data),

  // Leaves
  getLeaves: (params = {}) => api.get('/staff/leaves', { params }),
  applyLeave: (data) => api.post('/staff/leaves', data),
  decideLeave: (id, data) => api.patch(`/staff/leaves/${id}/decision`, data),
};
