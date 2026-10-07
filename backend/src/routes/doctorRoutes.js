const express = require('express');
const router = express.Router();

const DoctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCreateDoctor, validateCreateSchedule } = require('../middleware/doctorValidator');

router.use(authenticate);

// List doctors (All authenticated roles)
router.get('/', DoctorController.getDoctors);
router.get('/:id', DoctorController.getDoctorById);

// Doctor schedules
router.get('/:id/schedules', DoctorController.getSchedules);
router.post(
  '/:id/schedules',
  authorize('Administrator', 'Doctor'),
  validateCreateSchedule,
  DoctorController.addSchedule
);
router.delete(
  '/:id/schedules/:scheduleId',
  authorize('Administrator', 'Doctor'),
  DoctorController.deleteSchedule
);

// Doctor profile administration (Admin only)
router.post('/', authorize('Administrator'), validateCreateDoctor, DoctorController.createDoctor);
router.put('/:id', authorize('Administrator', 'Doctor'), DoctorController.updateDoctor);

module.exports = router;
