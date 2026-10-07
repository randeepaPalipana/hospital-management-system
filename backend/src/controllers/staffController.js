const StaffModel = require('../models/staffModel');
const DepartmentModel = require('../models/departmentModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class StaffController {
  // --- Employees Management ---
  static async getEmployees(req, res, next) {
    try {
      const { departmentId, status, search, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const employees = await StaffModel.findAllEmployees({
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        status: status || null,
        search: search?.trim() || null,
        limit: parseInt(limit, 10),
        offset,
      });
      return successResponse(res, 'Employees retrieved', employees);
    } catch (err) {
      next(err);
    }
  }

  static async getEmployeeById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const employee = await StaffModel.findEmployeeById(id);
      if (!employee) {
        return errorResponse(res, 'Employee not found', null, 404);
      }
      return successResponse(res, 'Employee details retrieved', employee);
    } catch (err) {
      next(err);
    }
  }

  static async createEmployee(req, res, next) {
    try {
      const id = await StaffModel.createEmployee(req.body);
      const employee = await StaffModel.findEmployeeById(id);
      await logAudit(req, 'CREATE', 'employees', id, {
        code: employee.employee_code,
        name: `${employee.first_name} ${employee.last_name}`,
        designation: employee.designation,
      });
      return successResponse(res, 'Employee registered successfully', employee, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateEmployee(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const emp = await StaffModel.findEmployeeById(id);
      if (!emp) return errorResponse(res, 'Employee not found', null, 404);

      await StaffModel.updateEmployee(id, req.body);
      const updated = await StaffModel.findEmployeeById(id);
      await logAudit(req, 'UPDATE', 'employees', id, req.body);
      return successResponse(res, 'Employee updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }

  // --- Attendance Management ---
  static async getAttendance(req, res, next) {
    try {
      const { date, departmentId } = req.query;
      const roster = await StaffModel.getAttendance({
        date: date || null,
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
      });
      return successResponse(res, 'Daily attendance roster retrieved', roster);
    } catch (err) {
      next(err);
    }
  }

  static async recordAttendance(req, res, next) {
    try {
      await StaffModel.recordAttendance(req.body);
      await logAudit(req, 'RECORD_ATTENDANCE', 'attendance', req.body.employee_id, {
        status: req.body.status,
        date: req.body.date,
      });
      return successResponse(res, 'Attendance logged successfully');
    } catch (err) {
      next(err);
    }
  }

  // --- Leave Management ---
  static async getLeaves(req, res, next) {
    try {
      const { status, employeeId, limit = 50, page = 1 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const leaves = await StaffModel.getLeaves({
        status: status || null,
        employeeId: employeeId ? parseInt(employeeId, 10) : null,
        limit: parseInt(limit, 10),
        offset,
      });
      return successResponse(res, 'Leave records retrieved', leaves);
    } catch (err) {
      next(err);
    }
  }

  static async applyLeave(req, res, next) {
    try {
      const id = await StaffModel.applyLeave(req.body);
      await logAudit(req, 'APPLY_LEAVE', 'leave_records', id, {
        type: req.body.leave_type,
        start: req.body.start_date,
        end: req.body.end_date,
      });
      return successResponse(res, 'Leave application submitted successfully', { id, ...req.body }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async decideLeave(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, decision_notes } = req.body;
      await StaffModel.decideLeave(id, {
        status,
        approved_by: req.user.id,
        decision_notes,
      });
      await logAudit(req, 'DECIDE_LEAVE', 'leave_records', id, { status, decision_notes });
      return successResponse(res, `Leave application marked as ${status}`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = StaffController;
