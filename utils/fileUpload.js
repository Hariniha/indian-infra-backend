const multer = require('multer');
const path = require('path');
const ipfsConfig = require('../config/ipfs');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as Buffer

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ipfsConfig.allowedFileTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      ),
      false
    );
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: ipfsConfig.maxFileSize, // Max file size from config
  },
  fileFilter: fileFilter,
});

// Export different upload configurations
exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);

// Export raw multer instance for custom configurations
exports.upload = upload;

// File validation helper
exports.validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > ipfsConfig.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${ipfsConfig.maxFileSize / 1024 / 1024}MB`,
    };
  }

  if (!ipfsConfig.allowedFileTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.mimetype}`,
    };
  }

  return { valid: true };
};

// Get file extension
exports.getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Generate safe filename
exports.generateSafeFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const basename = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${basename}_${timestamp}_${random}${ext}`;
};
