const express = require('express');
const router = express.Router();

const AppointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateAppointment,
  validateUpdateStatus,
  validateReschedule,
} = require('../middleware/appointmentValidator');

router.use(authenticate);

// List appointments (Receptionist, Doctor, Nurse, Admin)
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  AppointmentController.getAppointments
);

// Get single appointment
router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  AppointmentController.getAppointmentById
);

// Check doctor slot availability on given date
router.get(
  '/doctor/:id/availability',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  AppointmentController.getDoctorSlots
);

// Book new appointment
router.post(
  '/',
  authorize('Administrator', 'Receptionist', 'Doctor', 'Nurse'),
  validateCreateAppointment,
  AppointmentController.createAppointment
);

// Update status (e.g. check-in, complete, cancel, no_show)
router.patch(
  '/:id/status',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  validateUpdateStatus,
  AppointmentController.updateStatus
);

// Reschedule appointment
router.patch(
  '/:id/reschedule',
  authorize('Administrator', 'Receptionist', 'Doctor'),
  validateReschedule,
  AppointmentController.rescheduleAppointment
);

module.exports = router;
