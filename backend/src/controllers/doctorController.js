const DoctorModel = require('../models/doctorModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class DoctorController {
  static async getDoctors(req, res, next) {
    try {
      const { departmentId, search, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const doctors = await DoctorModel.findAll({
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        search: search?.trim() || null,
        limit: parseInt(limit, 10),
        offset,
      });
      return successResponse(res, 'Doctors retrieved', doctors);
    } catch (err) {
      next(err);
    }
  }

  static async getDoctorById(req, res, next) {
    try {
      const doctor = await DoctorModel.findById(parseInt(req.params.id, 10));
      if (!doctor) {
        return errorResponse(res, 'Doctor not found', null, 404);
      }
      return successResponse(res, 'Doctor details retrieved', doctor);
    } catch (err) {
      next(err);
    }
  }

  static async createDoctor(req, res, next) {
    try {
      const existing = await DoctorModel.findByLicense(req.body.license_number);
      if (existing) {
        return errorResponse(res, `Medical license '${req.body.license_number}' already registered`, null, 409);
      }

      const id = await DoctorModel.createWithEmployee(req.body);
      const doctor = await DoctorModel.findById(id);

      await logAudit(req, 'CREATE', 'doctors', id, {
        name: `${req.body.first_name} ${req.body.last_name}`,
        specialization: req.body.specialization,
      });

      return successResponse(res, 'Doctor profile registered successfully', doctor, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateDoctor(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const doctor = await DoctorModel.findById(id);
      if (!doctor) {
        return errorResponse(res, 'Doctor not found', null, 404);
      }

      await DoctorModel.update(id, req.body);
      const updated = await DoctorModel.findById(id);

      await logAudit(req, 'UPDATE', 'doctors', id, req.body);
      return successResponse(res, 'Doctor profile updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  // --- Schedules ---
  static async getSchedules(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const schedules = await DoctorModel.getSchedules(doctorId);
      return successResponse(res, 'Doctor schedules retrieved', schedules);
    } catch (err) {
      next(err);
    }
  }

  static async addSchedule(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const id = await DoctorModel.addSchedule(doctorId, req.body);
      await logAudit(req, 'CREATE', 'doctor_schedules', id, { doctorId, ...req.body });
      return successResponse(res, 'Schedule slot added successfully', { id, doctorId, ...req.body }, 201);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return errorResponse(res, 'A schedule for this day and start time already exists for this doctor', null, 409);
      }
      next(err);
    }
  }

  static async deleteSchedule(req, res, next) {
    try {
      const doctorId = parseInt(req.params.id, 10);
      const scheduleId = parseInt(req.params.scheduleId, 10);
      await DoctorModel.deleteSchedule(scheduleId, doctorId);
      await logAudit(req, 'DELETE', 'doctor_schedules', scheduleId, { doctorId });
      return successResponse(res, 'Schedule deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DoctorController;
