const express = require('express');
const router = express.Router();

const DepartmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCreateDepartment } = require('../middleware/doctorValidator');

router.use(authenticate);

// List all departments (accessible to all authenticated users for dropdowns/browsing)
router.get('/', DepartmentController.getDepartments);
router.get('/:id', DepartmentController.getDepartmentById);

// Department management (Admin only)
router.post('/', authorize('Administrator'), validateCreateDepartment, DepartmentController.createDepartment);
router.put('/:id', authorize('Administrator'), DepartmentController.updateDepartment);

module.exports = router;
