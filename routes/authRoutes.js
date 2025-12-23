const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateUserRegistration, validateWalletAddress } = require('../utils/validators');

// Public routes
router.post('/register', authLimiter, validateUserRegistration, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/check-wallet', validateWalletAddress, authController.checkWallet);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.get('/user/:walletAddress', protect, authController.getUserByWallet);

module.exports = router;
