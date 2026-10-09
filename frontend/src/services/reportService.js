import api from './api';

export const reportService = {
  // Operational Summary & Executive KPIs
  getExecutiveSummary: () => api.get('/reports/summary'),

  // Financial & Revenue
  getFinancialReport: (params = {}) => api.get('/reports/financial', { params }),

  // Patient Demographics & Admissions
  getPatientReport: () => api.get('/reports/patients'),

  // Laboratory Diagnostics Analytics
  getLaboratoryReport: () => api.get('/reports/laboratory'),

  // Pharmacy & Formulary Inventory
  getPharmacyReport: () => api.get('/reports/pharmacy'),

  // Appointments & Doctor Utilization
  getAppointmentsReport: (params = {}) => api.get('/reports/appointments', { params }),

  // Staff & HR Analytics
  getStaffReport: () => api.get('/reports/staff'),
};
