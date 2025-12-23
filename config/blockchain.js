module.exports = {
  rpcUrl: process.env.ETHEREUM_RPC_URL,
  network: process.env.ETHEREUM_NETWORK || 'sepolia',
  privateKey: process.env.PRIVATE_KEY,
  contractAddress: process.env.CONTRACT_ADDRESS,
  
  // Gas settings
  gasLimit: 3000000,
  maxFeePerGas: null, // Will be calculated dynamically
  maxPriorityFeePerGas: null, // Will be calculated dynamically
  
  // Confirmation settings
  confirmations: 2,
  timeout: 300000, // 5 minutes
};
