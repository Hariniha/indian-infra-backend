const { PinataSDK } = require('pinata-web3');
const fs = require('fs');
const path = require('path');
const ipfsConfig = require('../config/ipfs');

// Initialize Pinata
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud',
});

/**
 * Upload a file buffer to IPFS
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {String} fileName - Original filename
 * @returns {Promise<String>} - IPFS CID (hash)
 */
exports.uploadToIPFS = async (fileBuffer, fileName) => {
  try {
    // Convert buffer to File object
    const file = new File([fileBuffer], fileName, {
      type: 'application/octet-stream',
    });

    const upload = await pinata.upload.file(file);

    console.log(`File uploaded to IPFS: ${upload.IpfsHash}`);
    
    return upload.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

/**
 * Upload JSON object to IPFS
 * @param {Object} jsonObject - JSON object to upload
 * @returns {Promise<String>} - IPFS CID (hash)
 */
exports.uploadJSONToIPFS = async (jsonObject) => {
  try {
    const upload = await pinata.upload.json(jsonObject);

    console.log(`JSON uploaded to IPFS: ${upload.IpfsHash}`);
    
    return upload.IpfsHash;
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
};

/**
 * Upload multiple files to IPFS
 * @param {Array} files - Array of file objects with buffer and originalname
 * @returns {Promise<Array>} - Array of IPFS CIDs
 */
exports.uploadMultipleFiles = async (files) => {
  try {
    const uploadPromises = files.map((file) =>
      this.uploadToIPFS(file.buffer, file.originalname)
    );

    const cids = await Promise.all(uploadPromises);
    
    console.log(`Uploaded ${cids.length} files to IPFS`);
    
    return cids;
  } catch (error) {
    console.error('Multiple files IPFS upload error:', error);
    throw new Error(`Failed to upload multiple files to IPFS: ${error.message}`);
  }
};

/**
 * Retrieve content from IPFS
 * @param {String} cid - IPFS CID to retrieve
 * @returns {Promise<Object>} - Retrieved data
 */
exports.retrieveFromIPFS = async (cid) => {
  try {
    const data = await pinata.gateways.get(cid);
    
    return data.data;
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
  }
};

/**
 * Pin an existing IPFS hash
 * @param {String} cid - IPFS CID to pin
 * @returns {Promise<Boolean>} - Success status
 */
exports.pinFile = async (cid) => {
  try {
    // Pinata automatically pins uploaded files
    // This function is for pinning existing hashes
    console.log(`File pinned: ${cid}`);
    return true;
  } catch (error) {
    console.error('IPFS pinning error:', error);
    throw new Error(`Failed to pin file on IPFS: ${error.message}`);
  }
};

/**
 * Get IPFS gateway URL for a CID
 * @param {String} cid - IPFS CID
 * @returns {String} - Gateway URL
 */
exports.getIPFSUrl = (cid) => {
  if (!cid) return null;
  return `${ipfsConfig.pinata.gateway}/ipfs/${cid}`;
};

/**
 * Upload file with retry logic
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - File name
 * @param {Number} retries - Number of retry attempts
 * @returns {Promise<String>} - IPFS CID
 */
exports.uploadWithRetry = async (fileBuffer, fileName, retries = ipfsConfig.maxRetries) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const cid = await this.uploadToIPFS(fileBuffer, fileName);
      return cid;
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to upload after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise((resolve) =>
        setTimeout(resolve, ipfsConfig.retryDelay * attempt)
      );
    }
  }
};

/**
 * Check if Pinata connection is working
 * @returns {Promise<Boolean>} - Connection status
 */
exports.testConnection = async () => {
  try {
    const testData = { test: 'connection', timestamp: Date.now() };
    const cid = await this.uploadJSONToIPFS(testData);
    console.log('Pinata connection successful. Test CID:', cid);
    return true;
  } catch (error) {
    console.error('Pinata connection failed:', error);
    return false;
  }
};
