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

    const [appointments, medicalRecords, documents] = await Promise.all([
      PatientModel.getAppointmentHistory(id),
      PatientModel.getMedicalHistory(id),
      PatientModel.getDocuments(id),
    ]);

    return { patient, appointments, medicalRecords, documents };
  }

  /**
   * Upload and attach document to patient profile
   */
  static async uploadDocument(patientId, file, title, req) {
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      const err = new Error('Patient not found');
      err.statusCode = 404;
      throw err;
    }

    const docId = await PatientModel.addDocument({
      patient_id: patientId,
      uploaded_by: req.user.id,
      title: title || file.originalname,
      file_path: `/uploads/${file.filename}`,
      file_type: file.mimetype,
      file_size_bytes: file.size,
    });

    await logAudit(req, 'UPLOAD_DOCUMENT', 'patient_documents', docId, {
      patient_id: patientId,
      mrn: patient.mrn,
      title: title || file.originalname,
      file_path: `/uploads/${file.filename}`,
    });

    return PatientModel.findDocumentById(docId);
  }

  /**
   * Delete a patient document
   */
  static async deleteDocument(patientId, docId, req) {
    const doc = await PatientModel.findDocumentById(docId);
    if (!doc || doc.patient_id !== Number(patientId)) {
      const err = new Error('Document not found for this patient');
      err.statusCode = 404;
      throw err;
    }

    await PatientModel.deleteDocument(docId);

    await logAudit(req, 'DELETE_DOCUMENT', 'patient_documents', docId, {
      patient_id: patientId,
      title: doc.title,
    });

    return { success: true };
  }
}

module.exports = PatientService;
