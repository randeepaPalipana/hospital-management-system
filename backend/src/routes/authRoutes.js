const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateLogin, validateChangePassword } = require('../middleware/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with brute-force rate limiting
router.post('/login', authLimiter, validateLogin, AuthController.login);

// Protected routes (require valid JWT)
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, authLimiter, validateChangePassword, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
