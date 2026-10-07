const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseFormatter');

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      'Validation failed',
      errors.array().map((e) => ({ field: e.path || e.param, message: e.msg })),
      422
    );
  }
  next();
}

const validateCreateInvoice = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid patient ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one bill item is required'),
  body('items.*.description').trim().notEmpty().withMessage('Item description is required'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
  body('items.*.quantity').optional().isInt({ min: 1 }),
  body('discount_amount').optional().isFloat({ min: 0 }),
  body('tax_amount').optional().isFloat({ min: 0 }),
  checkValidation,
];

const validateRecordPayment = [
  param('id').isInt({ min: 1 }).withMessage('Invoice ID must be a positive integer'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than zero'),
  body('payment_method').isIn(['Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Bank Transfer', 'Online']).withMessage('Valid payment method is required'),
  body('transaction_reference').optional().trim(),
  body('notes').optional().trim(),
  checkValidation,
];

module.exports = {
  validateCreateInvoice,
  validateRecordPayment,
};
