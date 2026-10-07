const DepartmentModel = require('../models/departmentModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class DepartmentController {
  static async getDepartments(req, res, next) {
    try {
      const departments = await DepartmentModel.findAll();
      return successResponse(res, 'Departments retrieved', departments);
    } catch (err) {
      next(err);
    }
  }

  static async getDepartmentById(req, res, next) {
    try {
      const department = await DepartmentModel.findById(parseInt(req.params.id, 10));
      if (!department) {
        return errorResponse(res, 'Department not found', null, 404);
      }
      return successResponse(res, 'Department retrieved', department);
    } catch (err) {
      next(err);
    }
  }

  static async createDepartment(req, res, next) {
    try {
      const { name, code, description } = req.body;
      const existing = await DepartmentModel.findByCode(code);
      if (existing) {
        return errorResponse(res, `Department code '${code}' already exists`, null, 409);
      }

      const id = await DepartmentModel.create({ name, code, description });
      const department = await DepartmentModel.findById(id);

      await logAudit(req, 'CREATE', 'departments', id, { name, code });
      return successResponse(res, 'Department created successfully', department, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateDepartment(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const dept = await DepartmentModel.findById(id);
      if (!dept) {
        return errorResponse(res, 'Department not found', null, 404);
      }

      await DepartmentModel.update(id, req.body);
      const updated = await DepartmentModel.findById(id);

      await logAudit(req, 'UPDATE', 'departments', id, req.body);
      return successResponse(res, 'Department updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DepartmentController;
