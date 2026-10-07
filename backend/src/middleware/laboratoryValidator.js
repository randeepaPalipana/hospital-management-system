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

const validateCreateTest = [
  body('test_code').trim().notEmpty().withMessage('Test code is required').isLength({ max: 30 }),
  body('name').trim().notEmpty().withMessage('Test name is required').isLength({ max: 150 }),
  body('category').trim().notEmpty().withMessage('Test category is required'),
  body('standard_cost').optional().isFloat({ min: 0 }).withMessage('Standard cost must be non-negative'),
  checkValidation,
];

const validateCreateRequest = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid patient ID is required'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Valid doctor ID is required'),
  body('test_id').isInt({ min: 1 }).withMessage('Valid test ID is required'),
  body('sample_type').optional().trim(),
  checkValidation,
];

const validateRecordResult = [
  param('id').isInt({ min: 1 }).withMessage('Lab request ID must be a positive integer'),
  body('result_value').trim().notEmpty().withMessage('Result value or clinical finding is required'),
  body('is_abnormal').optional().isBoolean(),
  body('remarks').optional().trim(),
  checkValidation,
];

module.exports = {
  validateCreateTest,
  validateCreateRequest,
  validateRecordResult,
};
