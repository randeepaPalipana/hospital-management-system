const PatientService = require('../services/patientService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');

class PatientController {
  /**
   * GET /api/v1/patients — List patients with search/filter/pagination
   */
  static async getPatients(req, res, next) {
    try {
      const { search, gender, page = 1, limit = 15 } = req.query;
      const result = await PatientService.getPatients({
        search: search?.trim() || null,
        gender: gender || null,
        page: parseInt(page, 10),
        limit: Math.min(parseInt(limit, 10), 100), // cap at 100
      });
      return paginatedResponse(res, 'Patients retrieved', result.patients, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/patients/:id — Full patient profile
   */
  static async getPatientById(req, res, next) {
    try {
      const patient = await PatientService.getPatientById(parseInt(req.params.id, 10));
      return successResponse(res, 'Patient profile retrieved', patient);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/patients — Register new patient
   */
  static async createPatient(req, res, next) {
    try {
      const patient = await PatientService.createPatient(req.body, req);
      return successResponse(res, `Patient registered successfully. MRN: ${patient.mrn}`, patient, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/patients/:id — Update patient record
   */
  static async updatePatient(req, res, next) {
    try {
      const patient = await PatientService.updatePatient(
        parseInt(req.params.id, 10),
        req.body,
        req
      );
      return successResponse(res, 'Patient record updated successfully', patient);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/patients/:id/history — Full patient clinical history
   */
  static async getPatientHistory(req, res, next) {
    try {
      const history = await PatientService.getPatientHistory(parseInt(req.params.id, 10));
      return successResponse(res, 'Patient history retrieved', history);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/patients/:id/documents — Upload document
   */
  static async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }
      const { title } = req.body;
      const doc = await PatientService.uploadDocument(
        parseInt(req.params.id, 10),
        req.file,
        title,
        req
      );
      return successResponse(res, 'Document uploaded successfully', doc, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/patients/:id/documents/:docId — Delete document
   */
  static async deleteDocument(req, res, next) {
    try {
      const result = await PatientService.deleteDocument(
        parseInt(req.params.id, 10),
        parseInt(req.params.docId, 10),
        req
      );
      return successResponse(res, 'Document removed successfully', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PatientController;
