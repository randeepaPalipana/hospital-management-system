const MedicalRecordModel = require('../models/medicalRecordModel');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class MedicalRecordController {
  static async getMedicalRecords(req, res, next) {
    try {
      const { patientId, doctorId, search, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const records = await MedicalRecordModel.findAll({
        patientId: patientId ? parseInt(patientId, 10) : null,
        doctorId: doctorId ? parseInt(doctorId, 10) : null,
        search: search ? search.trim() : null,
        limit: parseInt(limit, 10),
        offset,
      });

      return successResponse(res, 'Medical records retrieved', records);
    } catch (err) {
      next(err);
    }
  }

  static async getMedicalRecordById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const record = await MedicalRecordModel.findById(id);
      if (!record) {
        return errorResponse(res, 'Medical record not found', null, 404);
      }

      // Fetch linked prescription if present
      const prescription = await MedicalRecordModel.getPrescriptionByRecordId(id);
      record.prescription = prescription;

      return successResponse(res, 'Medical record retrieved', record);
    } catch (err) {
      next(err);
    }
  }

  static async createMedicalRecord(req, res, next) {
    try {
      const { patient_id, doctor_id } = req.body;

      const patient = await PatientModel.findById(patient_id);
      if (!patient) return errorResponse(res, 'Patient not found', null, 404);

      const doctor = await DoctorModel.findById(doctor_id);
      if (!doctor) return errorResponse(res, 'Doctor not found', null, 404);

      const { recordId, prescriptionId } = await MedicalRecordModel.createWithPrescription(req.body);

      const created = await MedicalRecordModel.findById(recordId);
      if (prescriptionId) {
        created.prescription = await MedicalRecordModel.getPrescriptionById(prescriptionId);
      }

      await logAudit(req, 'CREATE', 'medical_records', recordId, {
        patient: `${patient.first_name} ${patient.last_name}`,
        doctor: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        diagnosis: req.body.diagnosis,
        hasPrescription: !!prescriptionId,
      });

      return successResponse(res, 'Medical record & encounter saved successfully', created, 201);
    } catch (err) {
      next(err);
    }
  }

  static async getPrescription(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const prescription = await MedicalRecordModel.getPrescriptionById(id);
      if (!prescription) {
        return errorResponse(res, 'Prescription not found', null, 404);
      }
      return successResponse(res, 'Prescription details retrieved', prescription);
    } catch (err) {
      next(err);
    }
  }

  static async updatePrescriptionStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      await MedicalRecordModel.updatePrescriptionStatus(id, status);
      await logAudit(req, 'UPDATE_STATUS', 'prescriptions', id, { status });
      return successResponse(res, `Prescription marked as ${status}`);
    } catch (err) {
      next(err);
    }
  }

  static async getMedicineCatalog(req, res, next) {
    try {
      const sql = `
        SELECT id, name, generic_name, category, dosage_form, strength, unit_price, reorder_level
        FROM medicines
        ORDER BY name ASC
      `;
      const meds = await query(sql);
      return successResponse(res, 'Medicines catalog retrieved', meds);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MedicalRecordController;
