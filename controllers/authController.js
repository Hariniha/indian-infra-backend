const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/helpers');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { walletAddress, role, name, company, email, phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  });

  if (existingUser) {
    return sendError(res, 400, 'User with this wallet address already exists');
  }

  // Create user
  const user = await User.create({
    walletAddress: walletAddress.toLowerCase(),
    role,
    name,
    company,
    email,
    phoneNumber,
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, walletAddress: user.walletAddress, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  sendSuccess(res, 201, 'User registered successfully', {
    user: {
      id: user._id,
      walletAddress: user.walletAddress,
      role: user.role,
      name: user.name,
      company: user.company,
      email: user.email,
    },
    token,
  });
});

// @desc    Login user with wallet signature
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { walletAddress, signature, message } = req.body;

  if (!walletAddress) {
    return sendError(res, 400, 'Wallet address is required');
  }

  // Find user
  const user = await User.findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  });

  if (!user) {
    return sendError(res, 404, 'User not found. Please register first.');
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 401, 'Your account has been deactivated');
  }

  // If signature verification is required
  if (signature && message) {
    const ethers = require('ethers');
    
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return sendError(res, 401, 'Invalid signature');
      }
    } catch (error) {
      return sendError(res, 401, 'Signature verification failed', error.message);
    }
  }

  // Update last login
  await user.updateLastLogin();

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, walletAddress: user.walletAddress, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  sendSuccess(res, 200, 'Login successful', {
    user: {
      id: user._id,
      walletAddress: user.walletAddress,
      role: user.role,
      name: user.name,
      company: user.company,
      email: user.email,
      lastLogin: user.lastLogin,
    },
    token,
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('assignedProjects', 'projectId projectName status');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'Profile retrieved successfully', { user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, company, email, phoneNumber, profileImage } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Update fields
  if (name) user.name = name;
  if (company) user.company = company;
  if (email) user.email = email;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (profileImage) user.profileImage = profileImage;

  await user.save();

  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

// @desc    Get user by wallet address
// @route   GET /api/auth/user/:walletAddress
// @access  Private
exports.getUserByWallet = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

  const user = await User.findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  }).select('-__v');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendSuccess(res, 200, 'User retrieved successfully', { user });
});

// @desc    Check if wallet is registered
// @route   POST /api/auth/check-wallet
// @access  Public
exports.checkWallet = asyncHandler(async (req, res) => {
  const { walletAddress } = req.body;

  const user = await User.findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  });

  sendSuccess(res, 200, 'Wallet check completed', {
    exists: !!user,
    user: user ? {
      walletAddress: user.walletAddress,
      role: user.role,
      name: user.name,
    } : null,
  });
});
