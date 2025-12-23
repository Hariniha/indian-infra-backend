const express = require('express');
const router = express.Router();
const dppController = require('../controllers/dppController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const {
  validateDPPCreation,
  validateInstallationUpdate,
  validateEnrichment,
  validatePagination,
} = require('../utils/validators');

// Create DPP (Contractor only)
router.post(
  '/create',
  protect,
  checkPermission('createDPP'),
  validateDPPCreation,
  dppController.createDPP
);

// Get DPPs by project
router.get(
  '/project/:projectId',
  protect,
  validatePagination,
  dppController.getDPPsByProject
);

// Get single DPP details
router.get('/:dppId', protect, dppController.getDPPDetails);

// Update installation (Installer only)
router.put(
  '/:dppId/install',
  protect,
  checkPermission('updateInstallation'),
  validateInstallationUpdate,
  dppController.updateInstallation
);

// Enrich DPP (Supplier only)
router.put(
  '/:dppId/enrich',
  protect,
  checkPermission('enrichDPP'),
  validateEnrichment,
  dppController.enrichDPP
);

// Public verification endpoint
router.get('/:dppId/verify', dppController.verifyDPP);

// Get blockchain proof
router.get('/:dppId/blockchain-proof', dppController.getBlockchainProof);

// Search DPPs
router.get('/search', protect, validatePagination, dppController.searchDPPs);

module.exports = router;
