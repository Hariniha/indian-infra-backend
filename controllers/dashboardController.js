const DPP = require('../models/DPP');
const Project = require('../models/Project');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/helpers');

// @desc    Get owner dashboard data
// @route   GET /api/dashboard/owner/:projectId
// @access  Private (Owner only)
exports.getOwnerDashboard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Get project
  const project = await Project.findOne({ projectId });

  if (!project) {
    return sendError(res, 404, 'Project not found');
  }

  // Verify ownership
  if (project.ownerWalletAddress !== req.user.walletAddress.toLowerCase()) {
    return sendError(res, 403, 'Not authorized to access this dashboard');
  }

  // Get all DPPs for this project
  const allDPPs = await DPP.find({ projectId });

  // Calculate statistics
  const totalDPPs = allDPPs.length;
  const statusBreakdown = {
    created: allDPPs.filter((d) => d.status === 'created').length,
    installed: allDPPs.filter((d) => d.status === 'installed').length,
    enriched: allDPPs.filter((d) => d.status === 'enriched').length,
  };

  // Category breakdown
  const categoryBreakdown = {};
  allDPPs.forEach((dpp) => {
    categoryBreakdown[dpp.category] = (categoryBreakdown[dpp.category] || 0) + 1;
  });

  // Average completeness
  const avgCompleteness =
    totalDPPs > 0
      ? allDPPs.reduce((sum, dpp) => sum + dpp.documentCompleteness, 0) / totalDPPs
      : 0;

  // Recent DPPs
  const recentDPPs = await DPP.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('dppId productName category status createdAt');

  // Compliance rate
  const compliantDPPs = allDPPs.filter((d) => d.complianceStatus).length;
  const complianceRate = totalDPPs > 0 ? (compliantDPPs / totalDPPs) * 100 : 0;

  const dashboardData = {
    project: {
      projectId: project.projectId,
      projectName: project.projectName,
      status: project.status,
      location: project.location,
    },
    statistics: {
      totalDPPs,
      statusBreakdown,
      categoryBreakdown,
      averageCompleteness: Math.round(avgCompleteness),
      complianceRate: Math.round(complianceRate),
    },
    team: {
      contractors: project.authorizedContractors.length,
      installers: project.authorizedInstallers.length,
      suppliers: project.authorizedSuppliers.length,
    },
    recentDPPs,
  };

  sendSuccess(res, 200, 'Owner dashboard data retrieved successfully', dashboardData);
});

// @desc    Get contractor dashboard data
// @route   GET /api/dashboard/contractor
// @access  Private (Contractor only)
exports.getContractorDashboard = asyncHandler(async (req, res) => {
  const userWallet = req.user.walletAddress.toLowerCase();

  // Get all DPPs created by this contractor
  const myDPPs = await DPP.find({
    'procurementData.contractorWalletAddress': userWallet,
  }).sort({ createdAt: -1 });

  // Get assigned projects
  const assignedProjects = await Project.find({
    'authorizedContractors.walletAddress': userWallet,
  }).select('projectId projectName status');

  // Statistics
  const totalDPPsCreated = myDPPs.length;
  const dppsByProject = {};
  myDPPs.forEach((dpp) => {
    dppsByProject[dpp.projectId] = (dppsByProject[dpp.projectId] || 0) + 1;
  });

  // Recent activity
  const recentDPPs = myDPPs.slice(0, 10);

  const dashboardData = {
    statistics: {
      totalDPPsCreated,
      assignedProjects: assignedProjects.length,
      dppsByProject,
    },
    assignedProjects,
    recentDPPs,
  };

  sendSuccess(res, 200, 'Contractor dashboard data retrieved successfully', dashboardData);
});

// @desc    Get installer dashboard data
// @route   GET /api/dashboard/installer
// @access  Private (Installer only)
exports.getInstallerDashboard = asyncHandler(async (req, res) => {
  const userWallet = req.user.walletAddress.toLowerCase();

  // Get all DPPs installed by this installer
  const myInstallations = await DPP.find({
    'installationData.installerWalletAddress': userWallet,
  }).sort({ 'installationData.installationTimestamp': -1 });

  // Get assigned projects
  const assignedProjects = await Project.find({
    'authorizedInstallers.walletAddress': userWallet,
  }).select('projectId projectName status');

  // Pending installations (DPPs created but not yet installed)
  const projectIds = assignedProjects.map((p) => p.projectId);
  const pendingInstallations = await DPP.find({
    projectId: { $in: projectIds },
    status: 'created',
  }).select('dppId productName category projectId createdAt');

  // Statistics
  const totalInstallations = myInstallations.length;
  const installationsByProject = {};
  myInstallations.forEach((dpp) => {
    installationsByProject[dpp.projectId] =
      (installationsByProject[dpp.projectId] || 0) + 1;
  });

  // Recent activity
  const recentInstallations = myInstallations.slice(0, 10);

  const dashboardData = {
    statistics: {
      totalInstallations,
      assignedProjects: assignedProjects.length,
      pendingInstallations: pendingInstallations.length,
      installationsByProject,
    },
    assignedProjects,
    pendingInstallations,
    recentInstallations,
  };

  sendSuccess(res, 200, 'Installer dashboard data retrieved successfully', dashboardData);
});

// @desc    Get supplier dashboard data
// @route   GET /api/dashboard/supplier
// @access  Private (Supplier only)
exports.getSupplierDashboard = asyncHandler(async (req, res) => {
  const userWallet = req.user.walletAddress.toLowerCase();

  // Get all DPPs enriched by this supplier
  const myEnrichments = await DPP.find({
    'enrichmentData.supplierWalletAddress': userWallet,
  }).sort({ 'enrichmentData.enrichmentTimestamp': -1 });

  // Get assigned projects
  const assignedProjects = await Project.find({
    'authorizedSuppliers.walletAddress': userWallet,
  }).select('projectId projectName status');

  // Pending enrichments (DPPs installed but not yet enriched)
  const projectIds = assignedProjects.map((p) => p.projectId);
  const pendingEnrichments = await DPP.find({
    projectId: { $in: projectIds },
    status: { $in: ['created', 'installed'] },
  }).select('dppId productName category projectId status createdAt');

  // Statistics
  const totalEnrichments = myEnrichments.length;
  const enrichmentsByProject = {};
  myEnrichments.forEach((dpp) => {
    enrichmentsByProject[dpp.projectId] =
      (enrichmentsByProject[dpp.projectId] || 0) + 1;
  });

  // Recent activity
  const recentEnrichments = myEnrichments.slice(0, 10);

  const dashboardData = {
    statistics: {
      totalEnrichments,
      assignedProjects: assignedProjects.length,
      pendingEnrichments: pendingEnrichments.length,
      enrichmentsByProject,
    },
    assignedProjects,
    pendingEnrichments,
    recentEnrichments,
  };

  sendSuccess(res, 200, 'Supplier dashboard data retrieved successfully', dashboardData);
});

// @desc    Get regulator dashboard (overview of all projects)
// @route   GET /api/dashboard/regulator
// @access  Private (Regulator only)
exports.getRegulatorDashboard = asyncHandler(async (req, res) => {
  // Get all projects
  const allProjects = await Project.find().select(
    'projectId projectName location status createdAt'
  );

  // Get all DPPs
  const allDPPs = await DPP.find().select('projectId status complianceStatus');

  // Statistics
  const totalProjects = allProjects.length;
  const totalDPPs = allDPPs.length;
  const compliantDPPs = allDPPs.filter((d) => d.complianceStatus).length;
  const complianceRate = totalDPPs > 0 ? (compliantDPPs / totalDPPs) * 100 : 0;

  // DPPs by status
  const dppsByStatus = {
    created: allDPPs.filter((d) => d.status === 'created').length,
    installed: allDPPs.filter((d) => d.status === 'installed').length,
    enriched: allDPPs.filter((d) => d.status === 'enriched').length,
  };

  // Recent projects
  const recentProjects = allProjects.slice(0, 10);

  const dashboardData = {
    statistics: {
      totalProjects,
      totalDPPs,
      complianceRate: Math.round(complianceRate),
      dppsByStatus,
    },
    recentProjects,
  };

  sendSuccess(res, 200, 'Regulator dashboard data retrieved successfully', dashboardData);
});
