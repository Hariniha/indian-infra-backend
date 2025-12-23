const { ethers } = require('ethers');
const blockchainConfig = require('../config/blockchain');

// Smart Contract ABI - Deployed Contract
const DPP_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataIPFS",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "DPPCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "supplier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "enrichmentMetadataIPFS",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "DPPEnriched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "installer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "installationMetadataIPFS",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "InstallationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataIPFS",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataIPFS",
        "type": "string"
      }
    ],
    "name": "createProject",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "dppExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "dpps",
    "outputs": [
      {
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "procurementMetadataIPFS",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "installationMetadataIPFS",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "enrichmentMetadataIPFS",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "enrichmentMetadataIPFS",
        "type": "string"
      }
    ],
    "name": "enrichDPP",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      }
    ],
    "name": "getDPP",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      }
    ],
    "name": "getProject",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataIPFS",
        "type": "string"
      }
    ],
    "name": "mintDPP",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "projectExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "projects",
    "outputs": [
      {
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "metadataIPFS",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "installationMetadataIPFS",
        "type": "string"
      }
    ],
    "name": "updateInstallation",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "dppId",
        "type": "string"
      }
    ],
    "name": "verifyDPP",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
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
