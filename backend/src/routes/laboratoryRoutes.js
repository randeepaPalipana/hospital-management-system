const express = require('express');
const router = express.Router();

const LaboratoryController = require('../controllers/laboratoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateTest,
  validateCreateRequest,
  validateRecordResult,
} = require('../middleware/laboratoryValidator');

router.use(authenticate);

// --- Test Catalog Routes ---
router.get(
  '/tests',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  LaboratoryController.getTests
);

router.post(
  '/tests',
  authorize('Administrator', 'Laboratory Staff'),
  validateCreateTest,
  LaboratoryController.createTest
);

// --- Requisitions & Tracking Routes ---
router.get(
  '/requests',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  LaboratoryController.getRequests
);

router.get(
  '/requests/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  LaboratoryController.getRequestById
);

router.post(
  '/requests',
  authorize('Administrator', 'Doctor'),
  validateCreateRequest,
  LaboratoryController.createRequest
);

router.patch(
  '/requests/:id/status',
  authorize('Administrator', 'Laboratory Staff', 'Nurse'),
  LaboratoryController.updateStatus
);

// --- Result Entry Routes ---
router.post(
  '/requests/:id/results',
  authorize('Administrator', 'Laboratory Staff'),
  validateRecordResult,
  LaboratoryController.recordResult
);

module.exports = router;
