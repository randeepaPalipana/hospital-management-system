const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../utils/auditLogger');

class AuthController {
  /**
   * User login endpoint
   */
  static async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(identifier, password, req);
      return successResponse(res, 'Login successful', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(req, res) {
    return successResponse(res, 'User profile retrieved', req.user, 200);
  }

  /**
   * Change user password endpoint
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword, req);
      return successResponse(res, result.message, null, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User logout endpoint
   */
  static async logout(req, res, next) {
    try {
      await logAudit(req, 'LOGOUT', 'users', req.user.id, { username: req.user.username });
      return successResponse(res, 'Logout successful', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
