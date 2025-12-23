const Project = require('../models/Project');
const { asyncHandler } = require('./errorHandler');

// Permission matrix based on requirements
const PERMISSIONS = {
  owner: {
    createProject: true,
    createDPP: false,
    updateInstallation: false,
    enrichDPP: false,
    viewAll: true,
    manageUsers: true,
  },
  contractor: {
    createProject: false,
    createDPP: true,
    updateInstallation: false,
    enrichDPP: false,
    viewAll: false,
    manageUsers: false,
  },
  installer: {
    createProject: false,
    createDPP: false,
    updateInstallation: true,
    enrichDPP: false,
    viewAll: false,
    manageUsers: false,
  },
  supplier: {
    createProject: false,
    createDPP: false,
    updateInstallation: false,
    enrichDPP: true,
    viewAll: false,
    manageUsers: false,
  },
  regulator: {
    createProject: false,
    createDPP: false,
    updateInstallation: false,
    enrichDPP: false,
    viewAll: true, // Read-only
    manageUsers: false,
  },
};

// Check if user has specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role;
    const hasPermission = PERMISSIONS[userRole]?.[permission];

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Your role '${userRole}' does not have permission to ${permission}`,
      });
    }

    next();
  };
};

// Check if user is authorized for specific project
exports.checkProjectAuthorization = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required',
    });
  }

  const project = await Project.findOne({ projectId });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  const userWallet = req.user.walletAddress.toLowerCase();
  const userRole = req.user.role;

  // Owner always has access
  if (project.ownerWalletAddress === userWallet) {
    req.project = project;
    return next();
  }

  // Regulator has read-only access to all projects
  if (userRole === 'regulator') {
    req.project = project;
    return next();
  }

  // Check if user is authorized based on role
  const isAuthorized = project.isUserAuthorized(userWallet, userRole);

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this project',
    });
  }

  req.project = project;
  next();
});

// Check if user owns the project
exports.checkProjectOwnership = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required',
    });
  }

  const project = await Project.findOne({ projectId });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  const userWallet = req.user.walletAddress.toLowerCase();

  if (project.ownerWalletAddress !== userWallet) {
    return res.status(403).json({
      success: false,
      message: 'Only the project owner can perform this action',
    });
  }

  req.project = project;
  next();
});

// Validate role-based data access
exports.filterByRole = (req, res, next) => {
  const userRole = req.user.role;
  const userWallet = req.user.walletAddress.toLowerCase();

  // Add filters based on role
  switch (userRole) {
    case 'owner':
      // Owners see all their projects
      req.filters = { ownerWalletAddress: userWallet };
      break;

    case 'contractor':
      // Contractors see projects they're assigned to
      req.filters = {
        'authorizedContractors.walletAddress': userWallet,
      };
      break;

    case 'installer':
      // Installers see projects they're assigned to
      req.filters = {
        'authorizedInstallers.walletAddress': userWallet,
      };
      break;

    case 'supplier':
      // Suppliers see projects they're assigned to
      req.filters = {
        'authorizedSuppliers.walletAddress': userWallet,
      };
      break;

    case 'regulator':
      // Regulators see all projects (read-only)
      req.filters = {};
      break;

    default:
      req.filters = {};
  }

  next();
};

module.exports.PERMISSIONS = PERMISSIONS;
