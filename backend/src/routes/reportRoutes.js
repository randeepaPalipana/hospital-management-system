const express = require('express');
const router = express.Router();

const ReportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All reporting endpoints require JWT authentication
router.use(authenticate);

// Executive Summary / Dashboard overview (All authenticated roles)
router.get('/summary', ReportController.getExecutiveSummary);

// Financial reports (Admin, Billing)
router.get(
  '/financial',
  authorize('Administrator', 'Cashier'),
  ReportController.getFinancialReport
);

// Patient demographics & census (Admin, Doctor, Nurse)
router.get(
  '/patients',
  authorize('Administrator', 'Doctor', 'Nurse'),
  ReportController.getPatientReport
);

// Laboratory diagnostics statistics (Admin, Lab Technician, Doctor)
router.get(
  '/laboratory',
  authorize('Administrator', 'Lab Technician', 'Doctor'),
  ReportController.getLaboratoryReport
);

// Pharmacy inventory & consumption (Admin, Pharmacist)
router.get(
  '/pharmacy',
  authorize('Administrator', 'Pharmacist'),
  ReportController.getPharmacyReport
);

// Appointments & Doctor utilization (Admin, Receptionist, Doctor)
router.get(
  '/appointments',
  authorize('Administrator', 'Receptionist', 'Doctor'),
  ReportController.getAppointmentsReport
);

module.exports = router;
