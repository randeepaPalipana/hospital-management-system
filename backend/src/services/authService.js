const UserModel = require('../models/userModel');
const { comparePassword, hashPassword } = require('../utils/hashHelper');
const { generateToken } = require('../utils/tokenHelper');
const { logAudit } = require('../utils/auditLogger');

class AuthService {
  /**
   * Process user login
   */
  static async login(identifier, password, req) {
    const user = await UserModel.findByUsernameOrEmail(identifier);
    if (!user) {
      const err = new Error('Invalid username or password');
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error('Your account has been deactivated. Please contact your administrator.');
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid username or password');
      err.statusCode = 401;
      throw err;
    }

    // Generate JWT Token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
    };
    const token = generateToken(tokenPayload);

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Record audit log
    await logAudit(
      { ...req, user: { id: user.id } },
      'LOGIN',
      'users',
      user.id,
      { username: user.username, role: user.role_name }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        employee_id: user.employee_id,
        employee_name: user.employee_name,
      },
    };
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword, req) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Retrieve hash for comparison
    const fullUser = await UserModel.findByUsernameOrEmail(user.username);
    const isMatch = await comparePassword(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 400;
      throw err;
    }

    const newHash = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, newHash);

    // Record audit log
    await logAudit(req, 'CHANGE_PASSWORD', 'users', userId, { username: user.username });

    return { message: 'Password updated successfully' };
  }
}

module.exports = AuthService;
