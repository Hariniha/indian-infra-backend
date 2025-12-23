const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');
const Project = require('../models/Project');
const DPP = require('../models/DPP');
require('dotenv').config();

const connectDB = require('../config/database');

/**
 * Database Reset Script
 * DANGER: This will delete ALL data from the database
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askConfirmation = () => {
  return new Promise((resolve) => {
    rl.question(
      '⚠️  WARNING: This will DELETE ALL DATA from the database!\n' +
      '   Type "DELETE ALL DATA" to confirm: ',
      (answer) => {
        rl.close();
        resolve(answer === 'DELETE ALL DATA');
      }
    );
  });
};

const resetDatabase = async () => {
  try {
    console.log('🔧 Database Reset Tool\n');
    console.log(`📍 Target Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/dpp_system'}\n`);

    // Ask for confirmation
    const confirmed = await askConfirmation();

    if (!confirmed) {
      console.log('\n❌ Reset cancelled. Database unchanged.');
      process.exit(0);
    }

    console.log('\n🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Connected\n');

    // Get current counts
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const dppCount = await DPP.countDocuments();

    console.log('📊 Current Database State:');
    console.log(`   • Users: ${userCount}`);
    console.log(`   • Projects: ${projectCount}`);
    console.log(`   • DPPs: ${dppCount}\n`);

    // Delete all data
    console.log('🗑️  Deleting all data...');
    await User.deleteMany({});
    console.log('   ✓ Users deleted');
    
    await Project.deleteMany({});
    console.log('   ✓ Projects deleted');
    
    await DPP.deleteMany({});
    console.log('   ✓ DPPs deleted\n');

    // Drop indexes (optional - will be recreated on next insert)
    console.log('🔄 Resetting indexes...');
    await User.collection.dropIndexes();
    await Project.collection.dropIndexes();
    await DPP.collection.dropIndexes();
    console.log('   ✓ Indexes reset\n');

    console.log('═══════════════════════════════════════════');
    console.log('✨ Database reset completed successfully!');
    console.log('═══════════════════════════════════════════\n');
    console.log('💡 To populate with sample data, run:');
    console.log('   npm run seed:dev\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
};

// Run reset
resetDatabase();
