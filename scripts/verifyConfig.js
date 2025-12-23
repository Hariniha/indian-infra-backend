require('dotenv').config();
const mongoose = require('mongoose');
const { PinataSDK } = require('pinata-web3');
const { ethers } = require('ethers');

/**
 * Configuration Verification Script
 * Tests MongoDB, Pinata, and Blockchain connections
 */

console.log('\n🔍 INDIAN INFRA DPP BACKEND - Configuration Verification\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Test Results
const results = {
  mongodb: { status: '⏳ Pending', details: '' },
  pinata: { status: '⏳ Pending', details: '' },
  blockchain: { status: '⏳ Pending', details: '' },
  contract: { status: '⏳ Pending', details: '' }
};

// 1. Test MongoDB Connection
async function testMongoDB() {
  try {
    console.log('1️⃣  Testing MongoDB Connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    results.mongodb.status = '✅ Connected';
    results.mongodb.details = `Database: ${dbName}`;
    
    console.log(`   ✅ MongoDB Connected: ${dbName}\n`);
    
    await mongoose.connection.close();
  } catch (error) {
    results.mongodb.status = '❌ Failed';
    results.mongodb.details = error.message;
    console.error(`   ❌ MongoDB Error: ${error.message}\n`);
  }
}

// 2. Test Pinata Connection
async function testPinata() {
  try {
    console.log('2️⃣  Testing Pinata IPFS Connection...');
    
    if (!process.env.PINATA_JWT) {
      throw new Error('PINATA_JWT not found in .env');
    }

    const pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
    });

    // Test with a simple text upload
    const testData = {
      name: 'Indian Infra DPP System',
      description: 'Configuration test',
      timestamp: new Date().toISOString()
    };

    const upload = await pinata.upload.json(testData);
    
    results.pinata.status = '✅ Connected';
    results.pinata.details = `Test file uploaded: ${upload.IpfsHash}`;
    
    console.log(`   ✅ Pinata Connected`);
    console.log(`   📦 Test IPFS Hash: ${upload.IpfsHash}\n`);
    
  } catch (error) {
    results.pinata.status = '❌ Failed';
    results.pinata.details = error.message;
    console.error(`   ❌ Pinata Error: ${error.message}\n`);
  }
}

// 3. Test Blockchain Connection
async function testBlockchain() {
  try {
    console.log('3️⃣  Testing Blockchain Connection...');
    
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    
    if (!rpcUrl || rpcUrl.includes('YOUR-INFURA-PROJECT-ID')) {
      console.log('   ⚠️  Sepolia RPC URL not configured');
      console.log('   💡 To enable blockchain features:');
      console.log('      1. Get a free RPC URL from https://infura.io or https://alchemy.com');
      console.log('      2. Update SEPOLIA_RPC_URL in .env\n');
      results.blockchain.status = '⚠️  Not Configured';
      results.blockchain.details = 'RPC URL needed';
      return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    results.blockchain.status = '✅ Connected';
    results.blockchain.details = `Network: ${network.name} (Chain ID: ${network.chainId}), Block: ${blockNumber}`;
    
    console.log(`   ✅ Blockchain Connected`);
    console.log(`   🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`   📦 Current Block: ${blockNumber}\n`);
    
  } catch (error) {
    results.blockchain.status = '❌ Failed';
    results.blockchain.details = error.message;
    console.error(`   ❌ Blockchain Error: ${error.message}\n`);
  }
}

// 4. Test Smart Contract
async function testSmartContract() {
  try {
    console.log('4️⃣  Testing Smart Contract...');
    
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!rpcUrl || rpcUrl.includes('YOUR-INFURA-PROJECT-ID')) {
      console.log('   ⚠️  RPC URL not configured (skipping contract test)\n');
      results.contract.status = '⚠️  Not Configured';
      results.contract.details = 'RPC URL needed';
      return;
    }

    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS not found in .env');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      throw new Error('No contract found at this address');
    }
    
    results.contract.status = '✅ Deployed';
    results.contract.details = `Address: ${contractAddress}`;
    
    console.log(`   ✅ Smart Contract Found`);
    console.log(`   📝 Address: ${contractAddress}`);
    console.log(`   📊 Contract Size: ${(code.length - 2) / 2} bytes\n`);
    
  } catch (error) {
    results.contract.status = '❌ Failed';
    results.contract.details = error.message;
    console.error(`   ❌ Contract Error: ${error.message}\n`);
  }
}

// Run all tests
async function runVerification() {
  await testMongoDB();
  await testPinata();
  await testBlockchain();
  await testSmartContract();
  
  // Print summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 VERIFICATION SUMMARY\n');
  console.log(`MongoDB:         ${results.mongodb.status}`);
  console.log(`                 ${results.mongodb.details}\n`);
  console.log(`Pinata IPFS:     ${results.pinata.status}`);
  console.log(`                 ${results.pinata.details}\n`);
  console.log(`Blockchain:      ${results.blockchain.status}`);
  console.log(`                 ${results.blockchain.details}\n`);
  console.log(`Smart Contract:  ${results.contract.status}`);
  console.log(`                 ${results.contract.details}\n`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Check if ready to run
  const essentialServices = [
    results.mongodb.status.includes('✅'),
    results.pinata.status.includes('✅')
  ];
  
  if (essentialServices.every(s => s)) {
    console.log('🎉 READY TO START!');
    console.log('\n✅ Essential services (MongoDB + Pinata) are configured');
    console.log('✅ Your backend is ready to run: npm run dev\n');
    
    if (results.blockchain.status.includes('⚠️')) {
      console.log('💡 Optional: Add RPC URL to enable blockchain features');
      console.log('   Backend works without blockchain for initial testing\n');
    }
  } else {
    console.log('⚠️  CONFIGURATION INCOMPLETE');
    console.log('\n❌ Please fix the failed services above before starting\n');
  }
  
  process.exit(0);
}

// Execute
runVerification().catch(error => {
  console.error('\n❌ Verification script failed:', error);
  process.exit(1);
});
