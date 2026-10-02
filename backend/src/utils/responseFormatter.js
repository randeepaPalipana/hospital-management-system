/**
 * Send standard success JSON response
 */
function successResponse(res, message = 'Operation successful', data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send standard error JSON response
 */
function errorResponse(res, message = 'An error occurred', errors = null, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

/**
 * Send paginated success JSON response
 */
function paginatedResponse(res, message = 'Records fetched', data = [], pagination = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total || data.length,
      page: pagination.page || 1,
      limit: pagination.limit || data.length,
      totalPages: pagination.totalPages || 1,
    },
  });
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
