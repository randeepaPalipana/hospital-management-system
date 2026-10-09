const ReportModel = require('../models/reportModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

class ReportController {
  // 1. Executive Summary & Operational KPIs (for Dashboard and Summary Tab)
  static async getExecutiveSummary(req, res, next) {
    try {
      const summary = await ReportModel.getExecutiveSummary();
      return successResponse(res, 'Executive summary KPIs retrieved', summary);
    } catch (err) {
      next(err);
    }
  }

  // 2. Financial & Revenue Report
  static async getFinancialReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportModel.getFinancialReport({ startDate, endDate });
      return successResponse(res, 'Financial report retrieved', report);
    } catch (err) {
      next(err);
    }
  }

  // 3. Patients & Clinical Demographics Report
  static async getPatientReport(req, res, next) {
    try {
      const report = await ReportModel.getPatientReport();
      return successResponse(res, 'Patient demographics report retrieved', report);
    } catch (err) {
      next(err);
    }
  }

  // 4. Laboratory Diagnostics Report
  static async getLaboratoryReport(req, res, next) {
    try {
      const report = await ReportModel.getLaboratoryReport();
      return successResponse(res, 'Laboratory testing report retrieved', report);
    } catch (err) {
      next(err);
    }
  }

  // 5. Pharmacy & Formulary Inventory Report
  static async getPharmacyReport(req, res, next) {
    try {
      const report = await ReportModel.getPharmacyReport();
      return successResponse(res, 'Pharmacy and inventory report retrieved', report);
    } catch (err) {
      next(err);
    }
  }

  // 6. Appointments & Doctor Utilization Report
  static async getAppointmentsReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportModel.getAppointmentsReport({ startDate, endDate });
      return successResponse(res, 'Appointments and doctor utilization report retrieved', report);
    } catch (err) {
      next(err);
    }
  }

  // 7. Staff & HR Report
  static async getStaffReport(req, res, next) {
    try {
      const report = await ReportModel.getStaffReport();
      return successResponse(res, 'Staff, attendance, and HR report retrieved', report);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
