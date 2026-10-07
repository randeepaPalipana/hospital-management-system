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

const validateCreateAppointment = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid patient ID is required'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Valid doctor ID is required'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date is required (YYYY-MM-DD)'),
  body('time_slot').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid time slot is required (HH:MM or HH:MM:SS)'),
  body('reason_for_visit').optional().trim(),
  body('notes').optional().trim(),
  checkValidation,
];

const validateUpdateStatus = [
  param('id').isInt({ min: 1 }).withMessage('Appointment ID must be a positive integer'),
  body('status').isIn(['scheduled', 'completed', 'cancelled', 'no_show']).withMessage('Status must be scheduled, completed, cancelled, or no_show'),
  body('notes').optional().trim(),
  checkValidation,
];

const validateReschedule = [
  param('id').isInt({ min: 1 }).withMessage('Appointment ID must be a positive integer'),
  body('appointment_date').isISO8601().withMessage('Valid new appointment date is required (YYYY-MM-DD)'),
  body('time_slot').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Valid new time slot is required (HH:MM or HH:MM:SS)'),
  body('notes').optional().trim(),
  checkValidation,
];

module.exports = {
  validateCreateAppointment,
  validateUpdateStatus,
  validateReschedule,
};
