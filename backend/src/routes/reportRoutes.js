const express = require('express');
const router = express.Router();

const ReportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All reporting endpoints require JWT authentication
router.use(authenticate);

// Executive Summary / Dashboard overview (All authenticated roles)
router.get('/summary', ReportController.getExecutiveSummary);

// Financial reports (Admin, Accountant)
router.get(
  '/financial',
  authorize('Administrator', 'Accountant'),
  ReportController.getFinancialReport
);

// Patient demographics & census (Admin, Doctor, Nurse)
router.get(
  '/patients',
  authorize('Administrator', 'Doctor', 'Nurse'),
  ReportController.getPatientReport
);

// Laboratory diagnostics statistics (Admin, Laboratory Staff, Doctor)
router.get(
  '/laboratory',
  authorize('Administrator', 'Laboratory Staff', 'Doctor'),
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

// Staff, Attendance & HR Analytics (Admin)
router.get(
  '/staff',
  authorize('Administrator'),
  ReportController.getStaffReport
);

module.exports = router;
