const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Owner dashboard
router.get(
  '/owner/:projectId',
  protect,
  authorize('owner'),
  dashboardController.getOwnerDashboard
);

// Contractor dashboard
router.get(
  '/contractor',
  protect,
  authorize('contractor'),
  dashboardController.getContractorDashboard
);

// Installer dashboard
router.get(
  '/installer',
  protect,
  authorize('installer'),
  dashboardController.getInstallerDashboard
);

// Supplier dashboard
router.get(
  '/supplier',
  protect,
  authorize('supplier'),
  dashboardController.getSupplierDashboard
);

// Regulator dashboard
router.get(
  '/regulator',
  protect,
  authorize('regulator'),
  dashboardController.getRegulatorDashboard
);

module.exports = router;
