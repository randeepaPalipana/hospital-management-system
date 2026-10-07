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

const validateCreateEmployee = [
  body('department_id').isInt({ min: 1 }).withMessage('Valid department ID is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('last_name').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('designation').trim().notEmpty().withMessage('Designation/Role is required'),
  body('salary').optional().isFloat({ min: 0 }),
  checkValidation,
];

const validateRecordAttendance = [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
  body('date').optional().isISO8601().withMessage('Date must be YYYY-MM-DD'),
  body('status').isIn(['present', 'absent', 'late', 'half_day', 'on_leave']).withMessage('Valid attendance status required'),
  body('clock_in').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  body('clock_out').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
  checkValidation,
];

const validateApplyLeave = [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
  body('leave_type').isIn(['casual', 'sick', 'annual', 'maternity', 'emergency']).withMessage('Valid leave type required'),
  body('start_date').isISO8601().withMessage('Valid start date required (YYYY-MM-DD)'),
  body('end_date').isISO8601().withMessage('Valid end date required (YYYY-MM-DD)'),
  body('reason').trim().notEmpty().withMessage('Reason for leave is required'),
  checkValidation,
];

const validateDecideLeave = [
  param('id').isInt({ min: 1 }).withMessage('Leave ID must be positive integer'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('decision_notes').optional().trim(),
  checkValidation,
];

module.exports = {
  validateCreateEmployee,
  validateRecordAttendance,
  validateApplyLeave,
  validateDecideLeave,
};
