import api from './api';

export const billingService = {
  // Invoices
  getInvoices: (params = {}) => api.get('/billing/invoices', { params }),
  getInvoiceById: (id) => api.get(`/billing/invoices/${id}`),
  createInvoice: (data) => api.post('/billing/invoices', data),

  // Payments
  recordPayment: (invoiceId, data) => api.post(`/billing/invoices/${invoiceId}/payments`, data),

  // Unbilled Services
  getUnbilledServices: (patientId) => api.get(`/billing/unbilled/${patientId}`),
};
