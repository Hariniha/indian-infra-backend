/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
exports.sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} error - Error details
 */
exports.sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginate results
 * @param {Object} query - Mongoose query object
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Object} - Pagination metadata and results
 */
exports.paginate = async (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const results = await query.skip(skip).limit(limit);
  const total = await query.model.countDocuments(query.getQuery());

  return {
    results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {String} - ISO formatted date string
 */
exports.formatDate = (date) => {
  return date ? new Date(date).toISOString() : null;
};

/**
 * Generate random string
 * @param {Number} length - Length of the string
 * @returns {String} - Random string
 */
exports.generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

/**
 * Sleep for specified milliseconds
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after sleep
 */
exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if string is valid Ethereum address
 * @param {String} address - Address to validate
 * @returns {Boolean} - Validation result
 */
exports.isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Sanitize user input
 * @param {String} input - User input
 * @returns {String} - Sanitized input
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Calculate percentage
 * @param {Number} part - Part value
 * @param {Number} total - Total value
 * @returns {Number} - Percentage
 */
exports.calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};
