const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Middleware to format validation results
 */
function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return errorResponse(res, 'Validation failed', extractedErrors, 422);
  }
  next();
}

const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  checkValidation,
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),
  checkValidation,
];

const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, dots, or dashes'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role_id')
    .isInt({ min: 1 })
    .withMessage('A valid role_id is required'),
  checkValidation,
];

module.exports = {
  validateLogin,
  validateChangePassword,
  validateCreateUser,
};
