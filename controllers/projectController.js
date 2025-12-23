const Project = require('../models/Project');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, sendError, paginate } = require('../utils/helpers');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const { generateDPPQRCode } = require('../utils/qrCodeGenerator');

// @desc    Create a new project
// @route   POST /api/projects/create
// @access  Private (Owner only)
exports.createProject = asyncHandler(async (req, res) => {
  const {
    projectName,
    location,
    projectType,
    totalFloors,
    zones,
    timeline,
    budget,
    description,
  } = req.body;

  // Create project metadata for IPFS
  const projectMetadata = {
    projectName,
    location,
    projectType,
    totalFloors,
    zones,
    owner: req.user.walletAddress,
    createdAt: new Date().toISOString(),
    timeline,
    budget,
    description,
  };

  try {
    // Upload metadata to IPFS
    const ipfsHash = await ipfsService.uploadJSONToIPFS(projectMetadata);

    // Create project in database first (to get projectId)
    const project = await Project.create({
      projectName,
      location,
      projectType,
      totalFloors,
      zones,
      ownerWalletAddress: req.user.walletAddress.toLowerCase(),
      timeline,
      budget,
      description,
      ipfsHash,
    });

    // Generate QR code
    const { qrCode } = await generateDPPQRCode(project.projectId);
    project.qrCode = qrCode;

    // Create project on blockchain (optional - can fail without breaking flow)
    try {
      const blockchainResult = await blockchainService.createProject(
        project.projectId,
        ipfsHash
      );
      project.blockchainTxHash = blockchainResult.transactionHash;
    } catch (blockchainError) {
      console.error('Blockchain error (non-critical):', blockchainError.message);
      // Continue without blockchain transaction
    }

    await project.save();

    // Add project to user's assigned projects
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { assignedProjects: project._id },
    });

    sendSuccess(res, 201, 'Project created successfully', { project });
  } catch (error) {
    sendError(res, 500, 'Failed to create project', error.message);
  }
});

// @desc    Get all projects (filtered by user role)
// @route   GET /api/projects
// @access  Private
exports.getAllProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, projectType } = req.query;

  // Build query based on user role (req.filters set by filterByRole middleware)
  let query = Project.find(req.filters || {});

  // Additional filters
  if (status) {
    query = query.where('status').equals(status);
  }

  if (projectType) {
    query = query.where('projectType').equals(projectType);
  }

  // Sort by creation date (newest first)
  query = query.sort({ createdAt: -1 });

  // Paginate results
  const { results: projects, pagination } = await paginate(
    query,
    parseInt(page),
    parseInt(limit)
  );

  sendSuccess(res, 200, 'Projects retrieved successfully', {
    projects,
    pagination,
  });
});

// @desc    Get single project details
// @route   GET /api/projects/:projectId
// @access  Private
exports.getProjectDetails = asyncHandler(async (req, res) => {
  // Project already loaded by checkProjectAuthorization middleware
  const project = req.project;

  // Get DPP count for this project
  const DPP = require('../models/DPP');
  const dppCount = await DPP.countDocuments({ projectId: project.projectId });

  const projectData = project.toObject();
  projectData.dppCount = dppCount;

  sendSuccess(res, 200, 'Project details retrieved successfully', {
    project: projectData,
  });
});

// @desc    Update project details
// @route   PUT /api/projects/:projectId
// @access  Private (Owner only)
exports.updateProject = asyncHandler(async (req, res) => {
  const project = req.project;

  const {
    projectName,
    location,
    totalFloors,
    zones,
    timeline,
    status,
    budget,
    description,
  } = req.body;

  // Update fields
  if (projectName) project.projectName = projectName;
  if (location) project.location = { ...project.location, ...location };
  if (totalFloors !== undefined) project.totalFloors = totalFloors;
  if (zones) project.zones = zones;
  if (timeline) project.timeline = { ...project.timeline, ...timeline };
  if (status) project.status = status;
  if (budget) project.budget = { ...project.budget, ...budget };
  if (description) project.description = description;

  await project.save();

  sendSuccess(res, 200, 'Project updated successfully', { project });
});

// @desc    Add contractor to project
// @route   POST /api/projects/:projectId/add-contractor
// @access  Private (Owner only)
exports.addContractor = asyncHandler(async (req, res) => {
  const project = req.project;
  const { walletAddress } = req.body;

  // Check if user exists and is a contractor
  const contractor = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
    role: 'contractor',
  });

  if (!contractor) {
    return sendError(res, 404, 'Contractor not found or user is not a contractor');
  }

  // Check if already added
  const alreadyAdded = project.authorizedContractors.some(
    (c) => c.walletAddress === walletAddress.toLowerCase()
  );

  if (alreadyAdded) {
    return sendError(res, 400, 'Contractor already authorized for this project');
  }

  // Add contractor
  project.authorizedContractors.push({
    walletAddress: walletAddress.toLowerCase(),
    addedAt: new Date(),
  });

  await project.save();

  // Add project to contractor's assigned projects
  await User.findByIdAndUpdate(contractor._id, {
    $addToSet: { assignedProjects: project._id },
  });

  sendSuccess(res, 200, 'Contractor added successfully', { project });
});

// @desc    Add installer to project
// @route   POST /api/projects/:projectId/add-installer
// @access  Private (Owner only)
exports.addInstaller = asyncHandler(async (req, res) => {
  const project = req.project;
  const { walletAddress } = req.body;

  // Check if user exists and is an installer
  const installer = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
    role: 'installer',
  });

  if (!installer) {
    return sendError(res, 404, 'Installer not found or user is not an installer');
  }

  // Check if already added
  const alreadyAdded = project.authorizedInstallers.some(
    (i) => i.walletAddress === walletAddress.toLowerCase()
  );

  if (alreadyAdded) {
    return sendError(res, 400, 'Installer already authorized for this project');
  }

  // Add installer
  project.authorizedInstallers.push({
    walletAddress: walletAddress.toLowerCase(),
    addedAt: new Date(),
  });

  await project.save();

  // Add project to installer's assigned projects
  await User.findByIdAndUpdate(installer._id, {
    $addToSet: { assignedProjects: project._id },
  });

  sendSuccess(res, 200, 'Installer added successfully', { project });
});

// @desc    Add supplier to project
// @route   POST /api/projects/:projectId/add-supplier
// @access  Private (Owner only)
exports.addSupplier = asyncHandler(async (req, res) => {
  const project = req.project;
  const { walletAddress } = req.body;

  // Check if user exists and is a supplier
  const supplier = await User.findOne({
    walletAddress: walletAddress.toLowerCase(),
    role: 'supplier',
  });

  if (!supplier) {
    return sendError(res, 404, 'Supplier not found or user is not a supplier');
  }

  // Check if already added
  const alreadyAdded = project.authorizedSuppliers.some(
    (s) => s.walletAddress === walletAddress.toLowerCase()
  );

  if (alreadyAdded) {
    return sendError(res, 400, 'Supplier already authorized for this project');
  }

  // Add supplier
  project.authorizedSuppliers.push({
    walletAddress: walletAddress.toLowerCase(),
    addedAt: new Date(),
  });

  await project.save();

  // Add project to supplier's assigned projects
  await User.findByIdAndUpdate(supplier._id, {
    $addToSet: { assignedProjects: project._id },
  });

  sendSuccess(res, 200, 'Supplier added successfully', { project });
});

// @desc    Get project statistics
// @route   GET /api/projects/:projectId/stats
// @access  Private
exports.getProjectStats = asyncHandler(async (req, res) => {
  const project = req.project;
  const DPP = require('../models/DPP');

  // Get DPP statistics
  const totalDPPs = await DPP.countDocuments({ projectId: project.projectId });
  const createdDPPs = await DPP.countDocuments({ projectId: project.projectId, status: 'created' });
  const installedDPPs = await DPP.countDocuments({ projectId: project.projectId, status: 'installed' });
  const enrichedDPPs = await DPP.countDocuments({ projectId: project.projectId, status: 'enriched' });

  // Get category breakdown
  const categoryBreakdown = await DPP.aggregate([
    { $match: { projectId: project.projectId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Average document completeness
  const completenessResult = await DPP.aggregate([
    { $match: { projectId: project.projectId } },
    { $group: { _id: null, avgCompleteness: { $avg: '$documentCompleteness' } } },
  ]);

  const stats = {
    projectInfo: {
      projectId: project.projectId,
      projectName: project.projectName,
      status: project.status,
    },
    dppStats: {
      total: totalDPPs,
      created: createdDPPs,
      installed: installedDPPs,
      enriched: enrichedDPPs,
      completionRate: totalDPPs > 0 ? Math.round((enrichedDPPs / totalDPPs) * 100) : 0,
    },
    categoryBreakdown,
    averageCompleteness: completenessResult[0]?.avgCompleteness || 0,
    teamSize: {
      contractors: project.authorizedContractors.length,
      installers: project.authorizedInstallers.length,
      suppliers: project.authorizedSuppliers.length,
    },
  };

  sendSuccess(res, 200, 'Project statistics retrieved successfully', { stats });
});
