const express = require('express');
const router = express.Router();

const MedicalRecordController = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCreateMedicalRecord } = require('../middleware/medicalRecordValidator');

router.use(authenticate);

// Medicine catalog for prescription writing
router.get(
  '/medicines',
  authorize('Administrator', 'Doctor', 'Nurse', 'Pharmacist'),
  MedicalRecordController.getMedicineCatalog
);

// EMR List & Search
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse'),
  MedicalRecordController.getMedicalRecords
);

// Specific Encounter details
router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse'),
  MedicalRecordController.getMedicalRecordById
);

// Create Clinical Encounter with Prescription
router.post(
  '/',
  authorize('Administrator', 'Doctor'),
  validateCreateMedicalRecord,
  MedicalRecordController.createMedicalRecord
);

// Specific Prescription Details
router.get(
  '/prescriptions/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Pharmacist'),
  MedicalRecordController.getPrescription
);

// Dispensing state update
router.patch(
  '/prescriptions/:id/status',
  authorize('Administrator', 'Pharmacist', 'Doctor'),
  MedicalRecordController.updatePrescriptionStatus
);

module.exports = router;
