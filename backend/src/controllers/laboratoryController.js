const LaboratoryModel = require('../models/laboratoryModel');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class LaboratoryController {
  // --- Test Catalog ---
  static async getTests(req, res, next) {
    try {
      const { category } = req.query;
      const tests = await LaboratoryModel.findAllTests({ category });
      return successResponse(res, 'Laboratory test catalog retrieved', tests);
    } catch (err) {
      next(err);
    }
  }

  static async createTest(req, res, next) {
    try {
      const id = await LaboratoryModel.createTest(req.body);
      const test = await LaboratoryModel.findTestById(id);
      await logAudit(req, 'CREATE', 'lab_tests', id, { code: req.body.test_code, name: req.body.name });
      return successResponse(res, 'Lab test added to catalog successfully', test, 201);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return errorResponse(res, `Test code '${req.body.test_code}' already exists`, null, 409);
      }
      next(err);
    }
  }

  // --- Requests ---
  static async getRequests(req, res, next) {
    try {
      const { status, patientId, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const requests = await LaboratoryModel.findAllRequests({
        status: status || null,
        patientId: patientId ? parseInt(patientId, 10) : null,
        limit: parseInt(limit, 10),
        offset,
      });
      return successResponse(res, 'Lab requests retrieved', requests);
    } catch (err) {
      next(err);
    }
  }

  static async getRequestById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const request = await LaboratoryModel.findRequestById(id);
      if (!request) {
        return errorResponse(res, 'Lab request not found', null, 404);
      }
      return successResponse(res, 'Lab request details retrieved', request);
    } catch (err) {
      next(err);
    }
  }

  static async createRequest(req, res, next) {
    try {
      const { patient_id, doctor_id, test_id } = req.body;

      const patient = await PatientModel.findById(patient_id);
      if (!patient) return errorResponse(res, 'Patient not found', null, 404);

      const doctor = await DoctorModel.findById(doctor_id);
      if (!doctor) return errorResponse(res, 'Doctor not found', null, 404);

      const test = await LaboratoryModel.findTestById(test_id);
      if (!test) return errorResponse(res, 'Lab test not found in catalog', null, 404);

      const id = await LaboratoryModel.createRequest(req.body);
      const request = await LaboratoryModel.findRequestById(id);

      await logAudit(req, 'ORDER_TEST', 'lab_requests', id, {
        patient: `${patient.first_name} ${patient.last_name}`,
        test: test.name,
      });

      return successResponse(res, 'Lab test requisition ordered successfully', request, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const sampleCollected = status === 'sample_collected';

      await LaboratoryModel.updateRequestStatus(id, status, sampleCollected);
      const updated = await LaboratoryModel.findRequestById(id);

      await logAudit(req, 'UPDATE_STATUS', 'lab_requests', id, { status });
      return successResponse(res, `Requisition status updated to '${status}'`, updated);
    } catch (err) {
      next(err);
    }
  }

  // --- Results ---
  static async recordResult(req, res, next) {
    try {
      const lab_request_id = parseInt(req.params.id, 10);
      const { result_value, is_abnormal, remarks } = req.body;

      const request = await LaboratoryModel.findRequestById(lab_request_id);
      if (!request) {
        return errorResponse(res, 'Lab request not found', null, 404);
      }

      await LaboratoryModel.recordResult({
        lab_request_id,
        recorded_by_user_id: req.user.id,
        result_value,
        is_abnormal: !!is_abnormal,
        remarks,
      });

      const updated = await LaboratoryModel.findRequestById(lab_request_id);

      await logAudit(req, 'RECORD_RESULT', 'lab_results', lab_request_id, {
        test: request.test_name,
        patient: `${request.patient_first_name} ${request.patient_last_name}`,
        is_abnormal: !!is_abnormal,
      });

      return successResponse(res, 'Laboratory result recorded and verified successfully', updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LaboratoryController;
