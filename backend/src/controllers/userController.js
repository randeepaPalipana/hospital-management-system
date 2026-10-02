const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { hashPassword } = require('../utils/hashHelper');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class UserController {
  /**
   * List all users with pagination and filtering (Admin only)
   */
  static async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = (page - 1) * limit;
      const roleId = req.query.roleId ? parseInt(req.query.roleId, 10) : null;
      const search = req.query.search ? req.query.search.trim() : null;

      const [users, total] = await Promise.all([
        UserModel.findAll({ roleId, search, limit, offset }),
        UserModel.countAll({ roleId, search }),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return paginatedResponse(res, 'Users retrieved successfully', users, {
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user details by ID
   */
  static async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await UserModel.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }
      return successResponse(res, 'User retrieved', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user (Admin only)
   */
  static async createUser(req, res, next) {
    try {
      const { role_id, username, email, password } = req.body;

      // Check if username or email already exists
      const existing = await UserModel.findByUsernameOrEmail(username);
      if (existing) {
        return errorResponse(res, 'A user with this username or email already exists', null, 409);
      }

      const role = await RoleModel.findById(role_id);
      if (!role) {
        return errorResponse(res, 'Specified role does not exist', null, 400);
      }

      const password_hash = await hashPassword(password);
      const newUserId = await UserModel.create({
        role_id,
        username,
        email,
        password_hash,
        is_active: true,
      });

      const createdUser = await UserModel.findById(newUserId);

      // Audit log
      await logAudit(req, 'CREATE_USER', 'users', newUserId, {
        username,
        role: role.name,
      });

      return successResponse(res, 'User created successfully', createdUser, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status or role (Admin only)
   */
  static async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { role_id, is_active } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      await UserModel.update(userId, { role_id, is_active });
      const updatedUser = await UserModel.findById(userId);

      // Audit log
      await logAudit(req, 'UPDATE_USER', 'users', userId, {
        role_id,
        is_active,
      });

      return successResponse(res, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all roles catalog
   */
  static async getRoles(req, res, next) {
    try {
      const roles = await RoleModel.findAll();
      return successResponse(res, 'Roles retrieved', roles);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
