const express = require('express');
const router = express.Router();

const PatientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCreatePatient, validateUpdatePatient } = require('../middleware/patientValidator');

// All patient routes require authentication
router.use(authenticate);

// List patients — accessible to clinical and admin roles
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  PatientController.getPatients
);

// Get patient profile by ID
router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  PatientController.getPatientById
);

// Get patient clinical history (appointments + EMR)
router.get(
  '/:id/history',
  authorize('Administrator', 'Doctor', 'Nurse'),
  PatientController.getPatientHistory
);

// Register new patient — Receptionist, Admin, Doctor
router.post(
  '/',
  authorize('Administrator', 'Receptionist', 'Doctor', 'Nurse'),
  validateCreatePatient,
  PatientController.createPatient
);

// Update patient record
router.put(
  '/:id',
  authorize('Administrator', 'Receptionist', 'Doctor', 'Nurse'),
  validateUpdatePatient,
  PatientController.updatePatient
);

module.exports = router;
