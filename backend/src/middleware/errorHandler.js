const { errorResponse } = require('../utils/responseFormatter');

/**
 * Handle 404 Route Not Found
 */
function notFoundHandler(req, res, next) {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} not found`, null, 404);
}

/**
 * Global Exception and Error Handler
 */
function globalErrorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  const errors = process.env.NODE_ENV === 'development' ? { stack: err.stack, details: err } : null;

  return errorResponse(res, message, errors, statusCode);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
