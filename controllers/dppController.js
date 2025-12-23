const DPP = require('../models/DPP');
const Project = require('../models/Project');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, sendError, paginate } = require('../utils/helpers');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const { generateDPPQRCode } = require('../utils/qrCodeGenerator');

// @desc    Create a new DPP (Procurement Phase - Contractor)
// @route   POST /api/dpp/create
// @access  Private (Contractor only)
exports.createDPP = asyncHandler(async (req, res) => {
  const {
    projectId,
    productName,
    category,
    quantity,
    unit,
    procurementData,
    metadata,
  } = req.body;

  // Check if project exists and user is authorized
  const project = await Project.findOne({ projectId });

  if (!project) {
    return sendError(res, 404, 'Project not found');
  }

  // Verify contractor is authorized
  const isAuthorized = project.isUserAuthorized(
    req.user.walletAddress,
    'contractor'
  );

  if (!isAuthorized) {
    return sendError(res, 403, 'You are not authorized for this project');
  }

  try {
    // Create procurement metadata for IPFS
    const procurementMetadata = {
      productName,
      category,
      quantity,
      unit,
      procurement: {
        ...procurementData,
        contractorWalletAddress: req.user.walletAddress,
        timestamp: new Date().toISOString(),
      },
      metadata,
    };

    // Upload procurement metadata to IPFS
    const metadataIPFS = await ipfsService.uploadJSONToIPFS(procurementMetadata);

    // Create DPP in database
    const dpp = await DPP.create({
      projectId,
      productName,
      category,
      quantity,
      unit,
      procurementData: {
        ...procurementData,
        contractorWalletAddress: req.user.walletAddress.toLowerCase(),
        procurementTimestamp: new Date(),
      },
      metadata,
      status: 'created',
    });

    // Generate QR code
    const { qrCode, verificationUrl } = await generateDPPQRCode(dpp.dppId);
    dpp.qrCode = qrCode;

    // Mint DPP on blockchain (optional)
    try {
      const blockchainResult = await blockchainService.mintDPP(
        dpp.dppId,
        projectId,
        metadataIPFS
      );
      dpp.procurementData.procurementBlockchainTxHash =
        blockchainResult.transactionHash;
    } catch (blockchainError) {
      console.error('Blockchain error (non-critical):', blockchainError.message);
    }

    await dpp.save();

    sendSuccess(res, 201, 'DPP created successfully', {
      dpp,
      verificationUrl,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to create DPP', error.message);
  }
});

// @desc    Get all DPPs for a project
// @route   GET /api/dpp/project/:projectId
// @access  Private
exports.getDPPsByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { page = 1, limit = 20, status, category } = req.query;

  // Check project authorization
  const project = await Project.findOne({ projectId });

  if (!project) {
    return sendError(res, 404, 'Project not found');
  }

  const isAuthorized = project.isUserAuthorized(
    req.user.walletAddress,
    req.user.role
  ) || project.ownerWalletAddress === req.user.walletAddress.toLowerCase();

  if (!isAuthorized && req.user.role !== 'regulator') {
    return sendError(res, 403, 'You are not authorized to view this project');
  }

  // Build query
  let query = DPP.find({ projectId });

  if (status) {
    query = query.where('status').equals(status);
  }

  if (category) {
    query = query.where('category').equals(category);
  }

  query = query.sort({ createdAt: -1 });

  // Paginate
  const { results: dpps, pagination } = await paginate(
    query,
    parseInt(page),
    parseInt(limit)
  );

  sendSuccess(res, 200, 'DPPs retrieved successfully', { dpps, pagination });
});

// @desc    Get single DPP details
// @route   GET /api/dpp/:dppId
// @access  Private
exports.getDPPDetails = asyncHandler(async (req, res) => {
  const { dppId } = req.params;

  const dpp = await DPP.findOne({ dppId }).populate('projectId', 'projectName location');

  if (!dpp) {
    return sendError(res, 404, 'DPP not found');
  }

  sendSuccess(res, 200, 'DPP details retrieved successfully', { dpp });
});

// @desc    Update installation data (Installer)
// @route   PUT /api/dpp/:dppId/install
// @access  Private (Installer only)
exports.updateInstallation = asyncHandler(async (req, res) => {
  const { dppId } = req.params;
  const { installationData } = req.body;

  const dpp = await DPP.findOne({ dppId });

  if (!dpp) {
    return sendError(res, 404, 'DPP not found');
  }

  // Check authorization
  const project = await Project.findOne({ projectId: dpp.projectId });

  if (!project) {
    return sendError(res, 404, 'Associated project not found');
  }

  const isAuthorized = project.isUserAuthorized(
    req.user.walletAddress,
    'installer'
  );

  if (!isAuthorized) {
    return sendError(res, 403, 'You are not authorized to update installation for this project');
  }

  try {
    // Create installation metadata for IPFS
    const installationMetadata = {
      dppId: dpp.dppId,
      installation: {
        ...installationData,
        installerWalletAddress: req.user.walletAddress,
        timestamp: new Date().toISOString(),
      },
    };

    // Upload to IPFS
    const metadataIPFS = await ipfsService.uploadJSONToIPFS(installationMetadata);

    // Update DPP
    dpp.installationData = {
      ...installationData,
      installerWalletAddress: req.user.walletAddress.toLowerCase(),
      installationTimestamp: new Date(),
    };

    // Update blockchain (optional)
    try {
      const blockchainResult = await blockchainService.updateInstallation(
        dppId,
        metadataIPFS
      );
      dpp.installationData.installationBlockchainTxHash =
        blockchainResult.transactionHash;
    } catch (blockchainError) {
      console.error('Blockchain error (non-critical):', blockchainError.message);
    }

    dpp.status = 'installed';
    await dpp.save();

    sendSuccess(res, 200, 'Installation data updated successfully', { dpp });
  } catch (error) {
    sendError(res, 500, 'Failed to update installation data', error.message);
  }
});

// @desc    Enrich DPP with technical documentation (Supplier)
// @route   PUT /api/dpp/:dppId/enrich
// @access  Private (Supplier only)
exports.enrichDPP = asyncHandler(async (req, res) => {
  const { dppId } = req.params;
  const { enrichmentData } = req.body;

  const dpp = await DPP.findOne({ dppId });

  if (!dpp) {
    return sendError(res, 404, 'DPP not found');
  }

  // Check authorization
  const project = await Project.findOne({ projectId: dpp.projectId });

  if (!project) {
    return sendError(res, 404, 'Associated project not found');
  }

  const isAuthorized = project.isUserAuthorized(
    req.user.walletAddress,
    'supplier'
  );

  if (!isAuthorized) {
    return sendError(res, 403, 'You are not authorized to enrich DPP for this project');
  }

  try {
    // Create enrichment metadata for IPFS
    const enrichmentMetadata = {
      dppId: dpp.dppId,
      enrichment: {
        ...enrichmentData,
        supplierWalletAddress: req.user.walletAddress,
        timestamp: new Date().toISOString(),
      },
    };

    // Upload to IPFS
    const metadataIPFS = await ipfsService.uploadJSONToIPFS(enrichmentMetadata);

    // Update DPP
    dpp.enrichmentData = {
      ...enrichmentData,
      supplierWalletAddress: req.user.walletAddress.toLowerCase(),
      enrichmentTimestamp: new Date(),
    };

    // Update blockchain (optional)
    try {
      const blockchainResult = await blockchainService.enrichDPP(
        dppId,
        metadataIPFS
      );
      dpp.enrichmentData.enrichmentBlockchainTxHash =
        blockchainResult.transactionHash;
    } catch (blockchainError) {
      console.error('Blockchain error (non-critical):', blockchainError.message);
    }

    dpp.status = 'enriched';
    dpp.complianceStatus = true; // Mark as compliant when fully enriched
    await dpp.save();

    sendSuccess(res, 200, 'DPP enriched successfully', { dpp });
  } catch (error) {
    sendError(res, 500, 'Failed to enrich DPP', error.message);
  }
});

// @desc    Verify DPP (Public QR scan verification)
// @route   GET /api/dpp/:dppId/verify
// @access  Public
exports.verifyDPP = asyncHandler(async (req, res) => {
  const { dppId } = req.params;

  const dpp = await DPP.findOne({ dppId });

  if (!dpp) {
    return sendError(res, 404, 'DPP not found or invalid QR code');
  }

  // Get project details
  const project = await Project.findOne({ projectId: dpp.projectId }).select(
    'projectName location status'
  );

  // Prepare verification response with limited data
  const verificationData = {
    dppId: dpp.dppId,
    productName: dpp.productName,
    category: dpp.category,
    quantity: dpp.quantity,
    unit: dpp.unit,
    status: dpp.status,
    documentCompleteness: dpp.documentCompleteness,
    complianceStatus: dpp.complianceStatus,
    project: project,
    createdAt: dpp.createdAt,
    verified: true,
  };

  // Add verification record
  dpp.verificationHistory.push({
    verifiedAt: new Date(),
    notes: 'QR code scanned',
  });

  await dpp.save();

  sendSuccess(res, 200, 'DPP verified successfully', verificationData);
});

// @desc    Get blockchain proof for DPP
// @route   GET /api/dpp/:dppId/blockchain-proof
// @access  Public
exports.getBlockchainProof = asyncHandler(async (req, res) => {
  const { dppId } = req.params;

  const dpp = await DPP.findOne({ dppId });

  if (!dpp) {
    return sendError(res, 404, 'DPP not found');
  }

  const blockchainProof = dpp.getBlockchainProof();

  sendSuccess(res, 200, 'Blockchain proof retrieved successfully', {
    proof: blockchainProof,
  });
});

// @desc    Search DPPs
// @route   GET /api/dpp/search
// @access  Private
exports.searchDPPs = asyncHandler(async (req, res) => {
  const { query, category, status, projectId, page = 1, limit = 20 } = req.query;

  let searchQuery = {};

  // Role-based filtering
  if (req.user.role !== 'owner' && req.user.role !== 'regulator') {
    // Get user's authorized projects
    const authorizedProjects = await Project.find({
      $or: [
        { ownerWalletAddress: req.user.walletAddress.toLowerCase() },
        { 'authorizedContractors.walletAddress': req.user.walletAddress.toLowerCase() },
        { 'authorizedInstallers.walletAddress': req.user.walletAddress.toLowerCase() },
        { 'authorizedSuppliers.walletAddress': req.user.walletAddress.toLowerCase() },
      ],
    }).select('projectId');

    const projectIds = authorizedProjects.map((p) => p.projectId);
    searchQuery.projectId = { $in: projectIds };
  }

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Filters
  if (category) searchQuery.category = category;
  if (status) searchQuery.status = status;
  if (projectId) searchQuery.projectId = projectId;

  let queryBuilder = DPP.find(searchQuery).sort({ createdAt: -1 });

  const { results: dpps, pagination } = await paginate(
    queryBuilder,
    parseInt(page),
    parseInt(limit)
  );

  sendSuccess(res, 200, 'Search completed successfully', { dpps, pagination });
});
