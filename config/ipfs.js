module.exports = {
  pinata: {
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY,
    jwt: process.env.PINATA_JWT,
    gateway: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud',
  },
  
  // File upload settings
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  
  // Retry settings
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
};
