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

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure Multer for patient document uploads
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB maximum
});

// Update patient record
router.put(
  '/:id',
  authorize('Administrator', 'Receptionist', 'Doctor', 'Nurse'),
  validateUpdatePatient,
  PatientController.updatePatient
);

// Upload patient document
router.post(
  '/:id/documents',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  upload.single('document'),
  PatientController.uploadDocument
);

// Delete patient document
router.delete(
  '/:id/documents/:docId',
  authorize('Administrator', 'Doctor', 'Nurse'),
  PatientController.deleteDocument
);

module.exports = router;
