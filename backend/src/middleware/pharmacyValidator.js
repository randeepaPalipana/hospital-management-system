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

const validateCreateMedicine = [
  body('name').trim().notEmpty().withMessage('Medicine name is required').isLength({ max: 150 }),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('dosage_form').trim().notEmpty().withMessage('Dosage form is required (e.g. Tablet, Syrup, Injection)'),
  body('unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
  body('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be non-negative integer'),
  checkValidation,
];

const validateAddBatch = [
  param('id').isInt({ min: 1 }).withMessage('Medicine ID must be a positive integer'),
  body('batch_number').trim().notEmpty().withMessage('Batch number is required').isLength({ max: 50 }),
  body('expiry_date').isISO8601().withMessage('Valid expiry date is required (YYYY-MM-DD)'),
  body('initial_quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('purchase_price').optional().isFloat({ min: 0 }),
  checkValidation,
];

module.exports = {
  validateCreateMedicine,
  validateAddBatch,
};
