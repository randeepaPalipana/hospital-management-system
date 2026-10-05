const { body, param, query } = require('express-validator');
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

const validateCreatePatient = [
  body('first_name').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('Max 50 characters'),
  body('last_name').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Max 50 characters'),
  body('dob').notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) >= new Date()) throw new Error('Date of birth cannot be in the future');
      return true;
    }),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  body('blood_group').optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
    .withMessage('Invalid blood group'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .isLength({ min: 7, max: 20 }).withMessage('Phone must be 7–20 characters'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('emergency_contact_phone').optional({ checkFalsy: true })
    .isLength({ min: 7, max: 20 }).withMessage('Emergency contact phone must be 7–20 characters'),
  checkValidation,
];

const validateUpdatePatient = [
  param('id').isInt({ min: 1 }).withMessage('Patient ID must be a positive integer'),
  body('first_name').optional().trim().notEmpty().isLength({ max: 50 }),
  body('last_name').optional().trim().notEmpty().isLength({ max: 50 }),
  body('dob').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']),
  body('blood_group').optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']),
  body('phone').optional().trim().isLength({ min: 7, max: 20 }),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  checkValidation,
];

module.exports = {
  validateCreatePatient,
  validateUpdatePatient,
};
