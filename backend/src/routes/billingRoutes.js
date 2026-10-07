const express = require('express');
const router = express.Router();

const BillingController = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateInvoice,
  validateRecordPayment,
} = require('../middleware/billingValidator');

router.use(authenticate);

// --- Invoices ---
router.get(
  '/invoices',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  BillingController.getInvoices
);

router.get(
  '/invoices/:id',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  BillingController.getInvoiceById
);

router.post(
  '/invoices',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  validateCreateInvoice,
  BillingController.createInvoice
);

// --- Payments ---
router.post(
  '/invoices/:id/payments',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  validateRecordPayment,
  BillingController.recordPayment
);

// --- Unbilled Patient Services ---
router.get(
  '/unbilled/:patientId',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  BillingController.getUnbilledServices
);

module.exports = router;
