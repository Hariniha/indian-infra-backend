const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  
  next();
};

// User registration validation
exports.validateUserRegistration = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['owner', 'contractor', 'installer', 'supplier', 'regulator'])
    .withMessage('Invalid role'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('phoneNumber')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number'),
  this.handleValidationErrors,
];

// Project creation validation
exports.validateProjectCreation = [
  body('projectName')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Project name must be between 3 and 200 characters'),
  body('projectType')
    .notEmpty()
    .withMessage('Project type is required')
    .isIn(['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Mixed-Use', 'Other'])
    .withMessage('Invalid project type'),
  body('location.address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  body('totalFloors')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total floors must be a positive number'),
  this.handleValidationErrors,
];

// DPP creation validation
exports.validateDPPCreation = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required'),
  body('productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required'),
  body('procurementData.supplierName')
    .notEmpty()
    .withMessage('Supplier name is required'),
  body('procurementData.deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery date format'),
  this.handleValidationErrors,
];

// Installation update validation
exports.validateInstallationUpdate = [
  param('dppId')
    .notEmpty()
    .withMessage('DPP ID is required'),
  body('installationData.installationLocation')
    .notEmpty()
    .withMessage('Installation location is required'),
  body('installationData.installationDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid installation date format'),
  body('installationData.installerName')
    .notEmpty()
    .withMessage('Installer name is required'),
  this.handleValidationErrors,
];

// Enrichment validation
exports.validateEnrichment = [
  param('dppId')
    .notEmpty()
    .withMessage('DPP ID is required'),
  this.handleValidationErrors,
];

// Wallet address validation
exports.validateWalletAddress = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isEthereumAddress()
    .withMessage('Invalid Ethereum address'),
  this.handleValidationErrors,
];

// Query pagination validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  this.handleValidationErrors,
];
