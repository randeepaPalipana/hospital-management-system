const express = require('express');
const router = express.Router();

const PharmacyController = require('../controllers/pharmacyController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateMedicine,
  validateAddBatch,
} = require('../middleware/pharmacyValidator');

router.use(authenticate);

// --- Medicine Formulary & Inventory ---
router.get(
  '/medicines',
  authorize('Administrator', 'Doctor', 'Nurse', 'Pharmacist'),
  PharmacyController.getMedicines
);

router.get(
  '/medicines/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Pharmacist'),
  PharmacyController.getMedicineById
);

router.post(
  '/medicines',
  authorize('Administrator', 'Pharmacist'),
  validateCreateMedicine,
  PharmacyController.createMedicine
);

router.put(
  '/medicines/:id',
  authorize('Administrator', 'Pharmacist'),
  PharmacyController.updateMedicine
);

// --- Batch Management & Expiry Monitoring ---
router.post(
  '/medicines/:id/batches',
  authorize('Administrator', 'Pharmacist'),
  validateAddBatch,
  PharmacyController.addBatch
);

router.get(
  '/expiring-batches',
  authorize('Administrator', 'Pharmacist'),
  PharmacyController.getExpiringBatches
);

// --- Prescription Queue & Dispensing ---
router.get(
  '/prescriptions',
  authorize('Administrator', 'Pharmacist', 'Doctor', 'Nurse'),
  PharmacyController.getPrescriptionsQueue
);

router.get(
  '/prescriptions/:id',
  authorize('Administrator', 'Pharmacist', 'Doctor', 'Nurse'),
  PharmacyController.getPrescriptionDetail
);

router.post(
  '/prescriptions/:id/dispense',
  authorize('Administrator', 'Pharmacist'),
  PharmacyController.dispense
);

module.exports = router;
