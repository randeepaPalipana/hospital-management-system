const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Global API rate limiter:
 * 100 requests per 15-minute window for standard endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
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
 * Stricter Rate Limiter for Authentication / Login & Password changes
 * Defends against brute-force password guessing attacks:
 * Max 10 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 authentication attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Too many authentication attempts detected. This IP address is temporarily throttled for 15 minutes.',
      null,
      429
    );
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
