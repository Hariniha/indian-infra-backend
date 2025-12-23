const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const {
  checkPermission,
  checkProjectAuthorization,
  checkProjectOwnership,
  filterByRole,
} = require('../middleware/rbac');
const {
  validateProjectCreation,
  validateWalletAddress,
  validatePagination,
} = require('../utils/validators');

// Create project (Owner only)
router.post(
  '/create',
  protect,
  checkPermission('createProject'),
  validateProjectCreation,
  projectController.createProject
);

// Get all projects (filtered by role)
router.get(
  '/',
  protect,
  filterByRole,
  validatePagination,
  projectController.getAllProjects
);

// Get single project details
router.get(
  '/:projectId',
  protect,
  checkProjectAuthorization,
  projectController.getProjectDetails
);

// Update project (Owner only)
router.put(
  '/:projectId',
  protect,
  checkProjectOwnership,
  projectController.updateProject
);

// Add team members (Owner only)
router.post(
  '/:projectId/add-contractor',
  protect,
  checkProjectOwnership,
  validateWalletAddress,
  projectController.addContractor
);

router.post(
  '/:projectId/add-installer',
  protect,
  checkProjectOwnership,
  validateWalletAddress,
  projectController.addInstaller
);

router.post(
  '/:projectId/add-supplier',
  protect,
  checkProjectOwnership,
  validateWalletAddress,
  projectController.addSupplier
);

// Get project statistics
router.get(
  '/:projectId/stats',
  protect,
  checkProjectAuthorization,
  projectController.getProjectStats
);

module.exports = router;
