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

const validateCreateMedicalRecord = [
  body('patient_id').isInt({ min: 1 }).withMessage('Valid patient ID is required'),
  body('doctor_id').isInt({ min: 1 }).withMessage('Valid doctor ID is required'),
  body('chief_complaint').trim().notEmpty().withMessage('Chief complaint is required'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('appointment_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('vitals_pulse').optional({ nullable: true }).isInt({ min: 20, max: 250 }),
  body('vitals_temp_c').optional({ nullable: true }).isFloat({ min: 30, max: 45 }),
  body('vitals_spo2').optional({ nullable: true }).isInt({ min: 50, max: 100 }),
  body('vitals_weight_kg').optional({ nullable: true }).isFloat({ min: 1, max: 500 }),
  body('prescription_items').optional().isArray(),
  body('prescription_items.*.medicine_id').optional().isInt({ min: 1 }),
  body('prescription_items.*.dosage').optional().trim().notEmpty(),
  body('prescription_items.*.frequency').optional().trim().notEmpty(),
  checkValidation,
];

module.exports = {
  validateCreateMedicalRecord,
};
