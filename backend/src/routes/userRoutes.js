const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCreateUser } = require('../middleware/authValidator');

// All user routes require authentication
router.use(authenticate);

// Get available roles (accessible to all authenticated users for forms/lookups)
router.get('/roles', UserController.getRoles);

// User administrative routes (Administrator role only)
router.get('/', authorize('Administrator'), UserController.getUsers);
router.post('/', authorize('Administrator'), validateCreateUser, UserController.createUser);
router.get('/:id', authorize('Administrator'), UserController.getUserById);
router.put('/:id', authorize('Administrator'), UserController.updateUser);

module.exports = router;
