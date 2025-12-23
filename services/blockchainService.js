const { ethers } = require('ethers');
const blockchainConfig = require('../config/blockchain');

// Smart Contract ABI - You'll need to replace this with your actual ABI after deployment
const DPP_CONTRACT_ABI = [
  // Project Creation
  'function createProject(string memory projectId, string memory metadataIPFS) public returns (bytes32)',
  'event ProjectCreated(string indexed projectId, address indexed owner, string metadataIPFS, uint256 timestamp)',
  
  // DPP Minting
  'function mintDPP(string memory dppId, string memory projectId, string memory metadataIPFS) public returns (bytes32)',
  'event DPPCreated(string indexed dppId, string indexed projectId, address indexed creator, string metadataIPFS, uint256 timestamp)',
  
  // Installation Update
  'function updateInstallation(string memory dppId, string memory installationMetadataIPFS) public returns (bytes32)',
  'event InstallationUpdated(string indexed dppId, address indexed installer, string installationMetadataIPFS, uint256 timestamp)',
  
  // Enrichment
  'function enrichDPP(string memory dppId, string memory enrichmentMetadataIPFS) public returns (bytes32)',
  'event DPPEnriched(string indexed dppId, address indexed supplier, string enrichmentMetadataIPFS, uint256 timestamp)',
  
  // Verification
  'function getDPP(string memory dppId) public view returns (tuple(string dppId, string projectId, address creator, uint256 createdAt, bool isActive))',
  'function verifyDPP(string memory dppId) public view returns (bool)',
];

// Initialize provider and wallet
let provider;
let wallet;
let contract;

const initializeBlockchain = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
    
    if (blockchainConfig.privateKey) {
      wallet = new ethers.Wallet(blockchainConfig.privateKey, provider);
    }
    
    if (blockchainConfig.contractAddress && wallet) {
      contract = new ethers.Contract(
        blockchainConfig.contractAddress,
        DPP_CONTRACT_ABI,
        wallet
      );
    }
  }
  
  return { provider, wallet, contract };
};

/**
 * Create a new project on the blockchain
 * @param {String} projectId - Unique project identifier
 * @param {String} metadataIPFS - IPFS hash of project metadata
 * @returns {Promise<Object>} - Transaction hash and receipt
 */
exports.createProject = async (projectId, metadataIPFS) => {
  try {
    initializeBlockchain();
    
    if (!contract) {
      throw new Error('Smart contract not initialized. Please set CONTRACT_ADDRESS in .env');
    }

    console.log(`Creating project ${projectId} on blockchain...`);

    const tx = await contract.createProject(projectId, metadataIPFS, {
      gasLimit: blockchainConfig.gasLimit,
    });

    console.log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait(blockchainConfig.confirmations);

    console.log(`Project created successfully. Block: ${receipt.blockNumber}`);

    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
    };
  } catch (error) {
    console.error('Blockchain createProject error:', error);
    throw new Error(`Failed to create project on blockchain: ${error.message}`);
  }
};

/**
 * Mint a new DPP on the blockchain
 * @param {String} dppId - Unique DPP identifier
 * @param {String} projectId - Associated project ID
 * @param {String} metadataIPFS - IPFS hash of DPP metadata
 * @returns {Promise<Object>} - Transaction hash and receipt
 */
exports.mintDPP = async (dppId, projectId, metadataIPFS) => {
  try {
    initializeBlockchain();
    
    if (!contract) {
      throw new Error('Smart contract not initialized. Please set CONTRACT_ADDRESS in .env');
    }

    console.log(`Minting DPP ${dppId} on blockchain...`);

    const tx = await contract.mintDPP(dppId, projectId, metadataIPFS, {
      gasLimit: blockchainConfig.gasLimit,
    });

    console.log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait(blockchainConfig.confirmations);

    console.log(`DPP minted successfully. Block: ${receipt.blockNumber}`);

    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
    };
  } catch (error) {
    console.error('Blockchain mintDPP error:', error);
    throw new Error(`Failed to mint DPP on blockchain: ${error.message}`);
  }
};

/**
 * Update installation data on the blockchain
 * @param {String} dppId - DPP identifier
 * @param {String} installationMetadataIPFS - IPFS hash of installation data
 * @returns {Promise<Object>} - Transaction hash and receipt
 */
exports.updateInstallation = async (dppId, installationMetadataIPFS) => {
  try {
    initializeBlockchain();
    
    if (!contract) {
      throw new Error('Smart contract not initialized. Please set CONTRACT_ADDRESS in .env');
    }

    console.log(`Updating installation for DPP ${dppId} on blockchain...`);

    const tx = await contract.updateInstallation(dppId, installationMetadataIPFS, {
      gasLimit: blockchainConfig.gasLimit,
    });

    console.log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait(blockchainConfig.confirmations);

    console.log(`Installation updated successfully. Block: ${receipt.blockNumber}`);

    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
    };
  } catch (error) {
    console.error('Blockchain updateInstallation error:', error);
    throw new Error(`Failed to update installation on blockchain: ${error.message}`);
  }
};

/**
 * Enrich DPP with additional documentation
 * @param {String} dppId - DPP identifier
 * @param {String} enrichmentMetadataIPFS - IPFS hash of enrichment data
 * @returns {Promise<Object>} - Transaction hash and receipt
 */
exports.enrichDPP = async (dppId, enrichmentMetadataIPFS) => {
  try {
    initializeBlockchain();
    
    if (!contract) {
      throw new Error('Smart contract not initialized. Please set CONTRACT_ADDRESS in .env');
    }

    console.log(`Enriching DPP ${dppId} on blockchain...`);

    const tx = await contract.enrichDPP(dppId, enrichmentMetadataIPFS, {
      gasLimit: blockchainConfig.gasLimit,
    });

    console.log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait(blockchainConfig.confirmations);

    console.log(`DPP enriched successfully. Block: ${receipt.blockNumber}`);

    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
    };
  } catch (error) {
    console.error('Blockchain enrichDPP error:', error);
    throw new Error(`Failed to enrich DPP on blockchain: ${error.message}`);
  }
};

/**
 * Get DPP data from blockchain
 * @param {String} dppId - DPP identifier
 * @returns {Promise<Object>} - DPP data from blockchain
 */
exports.getDPPFromBlockchain = async (dppId) => {
  try {
    initializeBlockchain();
    
    if (!contract) {
      throw new Error('Smart contract not initialized. Please set CONTRACT_ADDRESS in .env');
    }

    console.log(`Retrieving DPP ${dppId} from blockchain...`);

    const dppData = await contract.getDPP(dppId);

    return {
      dppId: dppData.dppId,
      projectId: dppData.projectId,
      creator: dppData.creator,
      createdAt: new Date(Number(dppData.createdAt) * 1000),
      isActive: dppData.isActive,
    };
  } catch (error) {
    console.error('Blockchain getDPP error:', error);
    throw new Error(`Failed to retrieve DPP from blockchain: ${error.message}`);
  }
};

/**
 * Verify if a transaction was successful
 * @param {String} txHash - Transaction hash
 * @returns {Promise<Object>} - Transaction status and details
 */
exports.verifyTransaction = async (txHash) => {
  try {
    initializeBlockchain();

    console.log(`Verifying transaction: ${txHash}`);

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        found: false,
        message: 'Transaction not found or still pending',
      };
    }

    return {
      found: true,
      status: receipt.status === 1 ? 'success' : 'failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      confirmations: await receipt.confirmations(),
    };
  } catch (error) {
    console.error('Transaction verification error:', error);
    throw new Error(`Failed to verify transaction: ${error.message}`);
  }
};

/**
 * Get current gas prices
 * @returns {Promise<Object>} - Gas price information
 */
exports.getGasPrices = async () => {
  try {
    initializeBlockchain();

    const feeData = await provider.getFeeData();

    return {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
    };
  } catch (error) {
    console.error('Get gas prices error:', error);
    throw new Error(`Failed to get gas prices: ${error.message}`);
  }
};

/**
 * Check blockchain connection
 * @returns {Promise<Boolean>} - Connection status
 */
exports.testConnection = async () => {
  try {
    initializeBlockchain();

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    console.log(`Connected to ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`Current block number: ${blockNumber}`);

    return true;
  } catch (error) {
    console.error('Blockchain connection failed:', error);
    return false;
  }
};

/**
 * Listen for contract events
 * @param {String} eventName - Name of the event to listen for
 * @param {Function} callback - Callback function to handle event
 */
exports.listenToEvents = (eventName, callback) => {
  try {
    initializeBlockchain();
    
    if (!contract) {
      throw new Error('Smart contract not initialized');
    }

    contract.on(eventName, (...args) => {
      console.log(`Event ${eventName} triggered:`, args);
      callback(...args);
    });

    console.log(`Listening to ${eventName} events...`);
  } catch (error) {
    console.error('Event listener setup error:', error);
    throw new Error(`Failed to setup event listener: ${error.message}`);
  }
};

module.exports.DPP_CONTRACT_ABI = DPP_CONTRACT_ABI;
