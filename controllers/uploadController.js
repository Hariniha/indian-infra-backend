const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, sendError } = require('../utils/helpers');
const ipfsService = require('../services/ipfsService');
const { validateFile } = require('../utils/fileUpload');

// @desc    Upload single file to IPFS
// @route   POST /api/upload/ipfs
// @access  Private
exports.uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'No file uploaded');
  }

  // Validate file
  const validation = validateFile(req.file);
  if (!validation.valid) {
    return sendError(res, 400, validation.error);
  }

  try {
    // Upload to IPFS
    const ipfsHash = await ipfsService.uploadToIPFS(
      req.file.buffer,
      req.file.originalname
    );

    const ipfsUrl = ipfsService.getIPFSUrl(ipfsHash);

    sendSuccess(res, 200, 'File uploaded successfully', {
      ipfsHash,
      ipfsUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to upload file to IPFS', error.message);
  }
});

// @desc    Upload multiple files to IPFS
// @route   POST /api/upload/ipfs-multiple
// @access  Private
exports.uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, 'No files uploaded');
  }

  // Validate all files
  for (const file of req.files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      return sendError(res, 400, `${file.originalname}: ${validation.error}`);
    }
  }

  try {
    // Upload all files to IPFS
    const uploadResults = await ipfsService.uploadMultipleFiles(req.files);

    const filesData = req.files.map((file, index) => ({
      fileName: file.originalname,
      ipfsHash: uploadResults[index],
      ipfsUrl: ipfsService.getIPFSUrl(uploadResults[index]),
      fileSize: file.size,
      mimeType: file.mimetype,
    }));

    sendSuccess(res, 200, 'Files uploaded successfully', {
      files: filesData,
      totalFiles: filesData.length,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to upload files to IPFS', error.message);
  }
});

// @desc    Retrieve file from IPFS
// @route   GET /api/upload/ipfs/:cid
// @access  Public
exports.retrieveFromIPFS = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return sendError(res, 400, 'IPFS CID is required');
  }

  try {
    const data = await ipfsService.retrieveFromIPFS(cid);

    sendSuccess(res, 200, 'File retrieved successfully', {
      cid,
      data,
      ipfsUrl: ipfsService.getIPFSUrl(cid),
    });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve file from IPFS', error.message);
  }
});

// @desc    Get IPFS gateway URL
// @route   GET /api/upload/ipfs-url/:cid
// @access  Public
exports.getIPFSUrl = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return sendError(res, 400, 'IPFS CID is required');
  }

  const ipfsUrl = ipfsService.getIPFSUrl(cid);

  sendSuccess(res, 200, 'IPFS URL generated successfully', {
    cid,
    ipfsUrl,
  });
});
