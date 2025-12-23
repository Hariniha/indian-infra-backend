const QRCode = require('qrcode');

/**
 * Generate QR code for DPP or Project
 * @param {String} data - Data to encode in QR code (typically DPP ID or verification URL)
 * @param {Object} options - QR code options
 * @returns {Promise<String>} - Base64 encoded QR code image
 */
exports.generateQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 300,
      ...options,
    };

    // Generate QR code as base64 string
    const qrCodeDataURL = await QRCode.toDataURL(data, defaultOptions);

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

/**
 * Generate verification URL for DPP
 * @param {String} dppId - DPP identifier
 * @param {String} baseUrl - Base URL of the frontend application
 * @returns {String} - Complete verification URL
 */
exports.generateVerificationUrl = (dppId, baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173') => {
  return `${baseUrl}/verify/${dppId}`;
};

/**
 * Generate QR code with verification URL
 * @param {String} dppId - DPP identifier
 * @returns {Promise<Object>} - QR code data URL and verification URL
 */
exports.generateDPPQRCode = async (dppId) => {
  try {
    const verificationUrl = this.generateVerificationUrl(dppId);
    const qrCode = await this.generateQRCode(verificationUrl);

    return {
      qrCode,
      verificationUrl,
    };
  } catch (error) {
    throw new Error(`Failed to generate DPP QR code: ${error.message}`);
  }
};

/**
 * Generate unique identifier for QR codes
 * @param {String} prefix - Prefix for the identifier
 * @returns {String} - Unique identifier
 */
exports.generateUniqueQRId = (prefix = 'QR') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};
