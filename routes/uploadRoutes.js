const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { uploadSingle, uploadMultiple } = require('../utils/fileUpload');

// Upload single file
router.post(
  '/ipfs',
  protect,
  uploadLimiter,
  uploadSingle('file'),
  uploadController.uploadSingleFile
);

// Upload multiple files
router.post(
  '/ipfs-multiple',
  protect,
  uploadLimiter,
  uploadMultiple('files', 10),
  uploadController.uploadMultipleFiles
);

// Retrieve file from IPFS
router.get('/ipfs/:cid', uploadController.retrieveFromIPFS);

// Get IPFS URL
router.get('/ipfs-url/:cid', uploadController.getIPFSUrl);

module.exports = router;
