const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateLogin, validateChangePassword } = require('../middleware/authValidator');

// Public routes
router.post('/login', validateLogin, AuthController.login);

// Protected routes (require valid JWT)
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, validateChangePassword, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
