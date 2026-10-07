const express = require('express');
const router = express.Router();

const StaffController = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateEmployee,
  validateRecordAttendance,
  validateApplyLeave,
  validateDecideLeave,
} = require('../middleware/staffValidator');

// Protect all staff endpoints with JWT authentication
router.use(authenticate);

// --- Employees Directory & Management ---
router.get('/employees', StaffController.getEmployees);
router.get('/employees/:id', StaffController.getEmployeeById);
router.post(
  '/employees',
  authorize('Administrator'),
  validateCreateEmployee,
  StaffController.createEmployee
);
router.put(
  '/employees/:id',
  authorize('Administrator'),
  StaffController.updateEmployee
);

// --- Attendance Roster ---
router.get('/attendance', StaffController.getAttendance);
router.post(
  '/attendance',
  authorize('Administrator', 'Doctor', 'Nurse'),
  validateRecordAttendance,
  StaffController.recordAttendance
);

// --- Leave Records ---
router.get('/leaves', StaffController.getLeaves);
router.post(
  '/leaves',
  validateApplyLeave,
  StaffController.applyLeave
);
router.patch(
  '/leaves/:id/decision',
  authorize('Administrator'),
  validateDecideLeave,
  StaffController.decideLeave
);

module.exports = router;
