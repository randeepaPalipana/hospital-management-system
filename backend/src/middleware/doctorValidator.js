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

const validateCreateDepartment = [
  body('name').trim().notEmpty().withMessage('Department name is required').isLength({ max: 100 }),
  body('code').trim().notEmpty().withMessage('Department code is required').isLength({ min: 2, max: 20 }),
  body('description').optional().trim(),
  checkValidation,
];

const validateCreateDoctor = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('department_id').isInt({ min: 1 }).withMessage('Valid department is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('license_number').trim().notEmpty().withMessage('Medical license number is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('consultation_fee').optional().isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),
  checkValidation,
];

const validateCreateSchedule = [
  body('day_of_week').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day of week is required'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid start time required (HH:MM or HH:MM:SS)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid end time required (HH:MM or HH:MM:SS)'),
  body('slot_duration_minutes').optional().isInt({ min: 5, max: 120 }),
  body('max_patients').optional().isInt({ min: 1, max: 100 }),
  checkValidation,
];

module.exports = {
  validateCreateDepartment,
  validateCreateDoctor,
  validateCreateSchedule,
};
