const AppointmentModel = require('../models/appointmentModel');
const DoctorModel = require('../models/doctorModel');
const PatientModel = require('../models/patientModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class AppointmentController {
  static async getAppointments(req, res, next) {
    try {
      const { doctorId, patientId, date, status, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const appointments = await AppointmentModel.findAll({
        doctorId: doctorId ? parseInt(doctorId, 10) : null,
        patientId: patientId ? parseInt(patientId, 10) : null,
        date: date || null,
        status: status || null,
        limit: parseInt(limit, 10),
        offset,
      });

      return successResponse(res, 'Appointments retrieved', appointments);
    } catch (err) {
      next(err);
    }
  }

  static async getAppointmentById(req, res, next) {
    try {
      const appt = await AppointmentModel.findById(parseInt(req.params.id, 10));
      if (!appt) {
        return errorResponse(res, 'Appointment not found', null, 404);
      }
      return successResponse(res, 'Appointment details retrieved', appt);
    } catch (err) {
      next(err);
    }
  }

  static async createAppointment(req, res, next) {
    try {
      const { patient_id, doctor_id, appointment_date, time_slot, reason_for_visit, notes } = req.body;

      // 1. Verify patient exists
      const patient = await PatientModel.findById(patient_id);
      if (!patient) {
        return errorResponse(res, 'Patient not found', null, 404);
      }

      // 2. Verify doctor exists
      const doctor = await DoctorModel.findById(doctor_id);
      if (!doctor) {
        return errorResponse(res, 'Doctor not found', null, 404);
      }

      // 3. Check for booking collision/conflict on this doctor at this slot
      const hasConflict = await AppointmentModel.checkConflict(doctor_id, appointment_date, time_slot);
      if (hasConflict) {
        return errorResponse(res, 'The selected doctor already has a scheduled appointment at this date and time slot.', null, 409);
      }

      const id = await AppointmentModel.create({
        patient_id,
        doctor_id,
        appointment_date,
        time_slot,
        reason_for_visit,
        notes,
      });

      const created = await AppointmentModel.findById(id);

      await logAudit(req, 'CREATE', 'appointments', id, {
        patient: `${patient.first_name} ${patient.last_name}`,
        doctor: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        date: appointment_date,
        slot: time_slot,
      });

      return successResponse(res, 'Appointment scheduled successfully', created, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, notes } = req.body;

      const appt = await AppointmentModel.findById(id);
      if (!appt) {
        return errorResponse(res, 'Appointment not found', null, 404);
      }

      await AppointmentModel.updateStatus(id, status, notes);
      const updated = await AppointmentModel.findById(id);

      await logAudit(req, 'UPDATE_STATUS', 'appointments', id, {
        oldStatus: appt.status,
        newStatus: status,
      });

      return successResponse(res, `Appointment status updated to '${status}'`, updated);
    } catch (err) {
      next(err);
    }
  }

  static async rescheduleAppointment(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { appointment_date, time_slot, notes } = req.body;

      const appt = await AppointmentModel.findById(id);
      if (!appt) {
        return errorResponse(res, 'Appointment not found', null, 404);
      }

      const hasConflict = await AppointmentModel.checkConflict(appt.doctor_id, appointment_date, time_slot, id);
      if (hasConflict) {
        return errorResponse(res, 'The selected slot conflicts with an existing appointment for this doctor', null, 409);
      }

      await AppointmentModel.reschedule(id, { appointment_date, time_slot, notes });
      const updated = await AppointmentModel.findById(id);

      await logAudit(req, 'RESCHEDULE', 'appointments', id, {
        oldDate: appt.appointment_date,
        oldSlot: appt.time_slot,
        newDate: appointment_date,
        newSlot: time_slot,
      });

      return successResponse(res, 'Appointment rescheduled successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  static async getDoctorSlots(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const { date } = req.query;
      if (!date) {
        return errorResponse(res, 'Date query parameter is required (YYYY-MM-DD)', null, 400);
      }

      const bookedSlots = await AppointmentModel.getDoctorDaySchedule(doctorId, date);
      const schedules = await DoctorModel.getSchedules(doctorId);

      return successResponse(res, 'Doctor availability retrieved', {
        doctorId,
        date,
        schedules,
        bookedSlots: bookedSlots.map((b) => b.time_slot?.substring(0, 5)),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AppointmentController;
