const { verifyToken } = require('../utils/tokenHelper');
const { errorResponse } = require('../utils/responseFormatter');
const UserModel = require('../models/userModel');

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid format. Please log in.', null, 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return errorResponse(res, 'Your session has expired. Please log in again.', null, 401);
      }
      return errorResponse(res, 'Invalid authentication token.', null, 401);
    }

    // Verify user still exists and is active
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'The user belonging to this token no longer exists.', null, 401);
    }

    if (!user.is_active) {
      return errorResponse(res, 'Your user account has been deactivated. Contact an administrator.', null, 403);
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    return errorResponse(res, 'Internal authentication error', null, 500);
  }
}

/**
 * Middleware to enforce Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles - e.g. 'Administrator', 'Doctor', 'Nurse'
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User identity not established', null, 401);
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role_name}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`,
        null,
        403
      );
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
