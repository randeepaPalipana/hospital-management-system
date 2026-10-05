const PatientModel = require('../models/patientModel');
const { logAudit } = require('../utils/auditLogger');

class PatientService {
  /**
   * Create a new patient registration
   */
  static async createPatient(data, req) {
    // Check for duplicate phone
    const existing = await PatientModel.findAll({ search: data.phone });
    const duplicate = existing.find(
      (p) => p.phone === data.phone
    );
    if (duplicate) {
      const err = new Error(`A patient with phone number '${data.phone}' already exists (MRN: ${duplicate.mrn})`);
      err.statusCode = 409;
      throw err;
    }

    const { insertId, mrn } = await PatientModel.create(data);
    const patient = await PatientModel.findById(insertId);

    await logAudit(req, 'CREATE', 'patients', insertId, {
      mrn,
      name: `${data.first_name} ${data.last_name}`,
    });

    return patient;
  }

  /**
   * Get paginated list of patients
   */
  static async getPatients({ search, gender, page = 1, limit = 15 }) {
    const offset = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      PatientModel.findAll({ search, gender, limit, offset }),
      PatientModel.countAll({ search, gender }),
    ]);

    return {
      patients,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get full patient profile by ID
   */
  static async getPatientById(id) {
    const patient = await PatientModel.findById(id);
    if (!patient) {
      const err = new Error('Patient not found');
      err.statusCode = 404;
      throw err;
    }
    return patient;
  }

  /**
   * Update patient record
   */
  static async updatePatient(id, data, req) {
    const patient = await PatientModel.findById(id);
    if (!patient) {
      const err = new Error('Patient not found');
      err.statusCode = 404;
      throw err;
    }

    await PatientModel.update(id, data);
    const updated = await PatientModel.findById(id);

    await logAudit(req, 'UPDATE', 'patients', id, {
      mrn: patient.mrn,
      changes: Object.keys(data),
    });

    return updated;
  }

  /**
   * Get patient full history (appointments + medical records)
   */
  static async getPatientHistory(id) {
    const patient = await PatientModel.findById(id);
    if (!patient) {
      const err = new Error('Patient not found');
      err.statusCode = 404;
      throw err;
    }

    const [appointments, medicalRecords] = await Promise.all([
      PatientModel.getAppointmentHistory(id),
      PatientModel.getMedicalHistory(id),
    ]);

    return { patient, appointments, medicalRecords };
  }
}

module.exports = PatientService;
