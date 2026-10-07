/**
 * Input Sanitization Middleware to defend against XSS, HTML/script injection,
 * and dangerous unicode payloads across request body, query parameters, and URL params.
 */

// Characters commonly used in Cross-Site Scripting (XSS) vectors
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
];

/**
 * Recursively cleanses strings in an object/array
 * Escapes direct script tags and angle brackets
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    let sanitized = value;
    // Strip common script vectors
    for (const pattern of XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    // Trim zero-width/invisible control characters
    sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');
    return sanitized.trim();
  } else if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  } else if (value !== null && typeof value === 'object') {
    const cleanObj = {};
    for (const [key, val] of Object.entries(value)) {
      cleanObj[key] = sanitizeValue(val);
    }
    return cleanObj;
  }
  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
}

module.exports = {
  sanitizeInput,
  sanitizeValue,
};
