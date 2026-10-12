const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Global API rate limiter:
 * 1000 requests per 15-minute window for standard endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous limit for single-page dashboard queries
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many requests originating from your IP address. Please try again after 15 minutes.',
      null,
      429
    );
  },
});

/**
 * Rate Limiter for Authentication / Login & Password changes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 attempts per 15 mins
  skipSuccessfulRequests: true, // Only count failed login attempts towards brute force limit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many failed authentication attempts detected. This IP address is temporarily throttled for 15 minutes.',
      null,
      429
    );
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
