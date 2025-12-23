module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  cookieExpire: process.env.JWT_COOKIE_EXPIRE || 7,
  
  // Generate JWT token
  generateToken: (id) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id }, module.exports.secret, {
      expiresIn: module.exports.expiresIn,
    });
  },
};
