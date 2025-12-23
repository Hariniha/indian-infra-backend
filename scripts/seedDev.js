const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const DPP = require('../models/DPP');
require('dotenv').config();

/**
 * Development Seeding Script
 * Seeds the database with sample data for testing
 */

const connectDB = require('../config/database');

// Sample wallet addresses (test addresses - DO NOT use in production)
const sampleWallets = {
  owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  contractor1: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  contractor2: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  installer1: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  installer2: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
  supplier1: '0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C',
  supplier2: '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB',
  regulator: '0x583031D1113aD414F02576BD6afaBfb302140225'
};

// Sample data
const users = [
  {
    walletAddress: sampleWallets.owner,
    name: 'Rajesh Kumar',
    email: 'rajesh@realestate.com',
    phoneNumber: '+91 98765 43210',
    role: 'owner',
    organizationName: 'Kumar Properties Ltd',
    organizationType: 'Real Estate Developer'
  },
  {
    walletAddress: sampleWallets.contractor1,
    name: 'Arjun Singh',
    email: 'arjun@construction.com',
    phoneNumber: '+91 98765 43211',
    role: 'contractor',
    organizationName: 'Singh Construction Co',
    organizationType: 'General Contractor',
    licenseNumber: 'GC-2024-001'
  },
  {
    walletAddress: sampleWallets.contractor2,
    name: 'Vikram Patel',
    email: 'vikram@builders.com',
    phoneNumber: '+91 98765 43212',
    role: 'contractor',
    organizationName: 'Patel Builders',
    organizationType: 'General Contractor',
    licenseNumber: 'GC-2024-002'
  },
  {
    walletAddress: sampleWallets.installer1,
    name: 'Amit Sharma',
    email: 'amit@installations.com',
    phoneNumber: '+91 98765 43213',
    role: 'installer',
    organizationName: 'Sharma Installations',
    organizationType: 'MEP Installer',
    licenseNumber: 'IN-2024-001'
  },
  {
    walletAddress: sampleWallets.installer2,
    name: 'Deepak Gupta',
    email: 'deepak@mepservices.com',
    phoneNumber: '+91 98765 43214',
    role: 'installer',
    organizationName: 'Gupta MEP Services',
    organizationType: 'MEP Installer',
    licenseNumber: 'IN-2024-002'
  },
  {
    walletAddress: sampleWallets.supplier1,
    name: 'Priya Reddy',
    email: 'priya@materials.com',
    phoneNumber: '+91 98765 43215',
    role: 'supplier',
    organizationName: 'Reddy Building Materials',
    organizationType: 'Material Supplier',
    licenseNumber: 'SU-2024-001'
  },
  {
    walletAddress: sampleWallets.supplier2,
    name: 'Sanjay Mehta',
    email: 'sanjay@suppliers.com',
    phoneNumber: '+91 98765 43216',
    role: 'supplier',
    organizationName: 'Mehta Suppliers',
    organizationType: 'Material Supplier',
    licenseNumber: 'SU-2024-002'
  },
  {
    walletAddress: sampleWallets.regulator,
    name: 'Dr. Anita Desai',
    email: 'anita@pwdgov.in',
    phoneNumber: '+91 98765 43217',
    role: 'regulator',
    organizationName: 'Public Works Department',
    organizationType: 'Government Authority'
  }
];

const projects = [
  {
    projectId: 'PROJ-2024-001',
    projectName: 'Mumbai Metro Station - Phase 3',
    projectType: 'Infrastructure',
    location: {
      address: 'Andheri East, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pinCode: '400069',
      coordinates: {
        latitude: 19.1136,
        longitude: 72.8697
      }
    },
    description: 'Construction of new metro station with modern amenities',
    ownerWalletAddress: sampleWallets.owner,
    authorizedContractors: [sampleWallets.contractor1],
    authorizedInstallers: [sampleWallets.installer1],
    authorizedSuppliers: [sampleWallets.supplier1],
    startDate: new Date('2024-01-15'),
    expectedCompletionDate: new Date('2025-06-30'),
    estimatedBudget: 250000000,
    status: 'active',
    projectMetadata: {
      totalArea: '15000 sqm',
      buildingType: 'Transit Infrastructure',
      certifications: ['IGBC', 'ISO 9001']
    }
  },
  {
    projectId: 'PROJ-2024-002',
    projectName: 'Bangalore Tech Park - Building A',
    projectType: 'Commercial',
    location: {
      address: 'Whitefield, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pinCode: '560066',
      coordinates: {
        latitude: 12.9698,
        longitude: 77.7500
      }
    },
    description: 'LEED Platinum certified commercial office building',
    ownerWalletAddress: sampleWallets.owner,
    authorizedContractors: [sampleWallets.contractor2],
    authorizedInstallers: [sampleWallets.installer2],
    authorizedSuppliers: [sampleWallets.supplier2],
    startDate: new Date('2024-02-01'),
    expectedCompletionDate: new Date('2025-12-31'),
    estimatedBudget: 500000000,
    status: 'active',
    projectMetadata: {
      totalArea: '50000 sqm',
      buildingType: 'Office Building',
      floors: 20,
      certifications: ['LEED Platinum', 'ISO 14001']
    }
  }
];

const dpps = [
  // DPPs for Mumbai Metro Project
  {
    dppId: 'DPP-2024-001',
    projectId: 'PROJ-2024-001',
    productName: 'Structural Steel Beams - Grade S355',
    category: 'Structural',
    quantity: 500,
    unit: 'tons',
    procurementData: {
      supplierWalletAddress: sampleWallets.supplier1,
      supplierName: 'Reddy Building Materials',
      procurementDate: new Date('2024-01-20'),
      batchNumber: 'STEEL-2024-001',
      manufacturingDate: new Date('2024-01-10'),
      expiryDate: new Date('2054-01-10'),
      price: 50000,
      currency: 'INR',
      specifications: {
        grade: 'S355JR',
        standard: 'IS 2062',
        yieldStrength: '355 MPa',
        tensileStrength: '470-630 MPa'
      },
      certifications: ['BIS Certification', 'Material Test Certificate'],
      documents: []
    },
    status: 'created',
    createdBy: sampleWallets.contractor1,
    metadata: {
      manufacturer: 'Tata Steel',
      countryOfOrigin: 'India',
      customsDetails: {
        hsCode: '7308.90'
      }
    }
  },
  {
    dppId: 'DPP-2024-002',
    projectId: 'PROJ-2024-001',
    productName: 'HVAC Chillers - 500 TR',
    category: 'MEP',
    quantity: 4,
    unit: 'units',
    procurementData: {
      supplierWalletAddress: sampleWallets.supplier1,
      supplierName: 'Reddy Building Materials',
      procurementDate: new Date('2024-02-01'),
      batchNumber: 'HVAC-2024-001',
      manufacturingDate: new Date('2024-01-15'),
      price: 8000000,
      currency: 'INR',
      specifications: {
        coolingCapacity: '500 TR',
        refrigerant: 'R-134a',
        efficiency: 'COP 6.5',
        voltage: '415V, 3-phase'
      },
      certifications: ['AHRI Certification', 'BEE 5-Star Rating'],
      documents: []
    },
    installationData: {
      installerWalletAddress: sampleWallets.installer1,
      installerName: 'Sharma Installations',
      installationDate: new Date('2024-03-15'),
      location: {
        building: 'Metro Station Main Building',
        floor: 'Basement',
        room: 'Mechanical Room-01',
        gridReference: 'B-MR-01'
      },
      installationPhotos: [],
      commissioningDate: new Date('2024-03-20'),
      warrantyStartDate: new Date('2024-03-20'),
      warrantyEndDate: new Date('2029-03-20'),
      maintenanceSchedule: 'Quarterly',
      certifications: ['Commissioning Certificate', 'Installation Compliance'],
      notes: 'Installed and commissioned successfully. Baseline efficiency tests completed.'
    },
    status: 'installed',
    createdBy: sampleWallets.contractor1,
    metadata: {
      manufacturer: 'Blue Star',
      countryOfOrigin: 'India',
      serialNumbers: ['BS-500TR-2024-001', 'BS-500TR-2024-002', 'BS-500TR-2024-003', 'BS-500TR-2024-004']
    }
  },
  // DPPs for Bangalore Tech Park
  {
    dppId: 'DPP-2024-003',
    projectId: 'PROJ-2024-002',
    productName: 'Solar PV Panels - 550W Monocrystalline',
    category: 'Renewable Energy',
    quantity: 2000,
    unit: 'panels',
    procurementData: {
      supplierWalletAddress: sampleWallets.supplier2,
      supplierName: 'Mehta Suppliers',
      procurementDate: new Date('2024-02-15'),
      batchNumber: 'SOLAR-2024-001',
      manufacturingDate: new Date('2024-01-30'),
      price: 30000,
      currency: 'INR',
      specifications: {
        wattage: '550W',
        efficiency: '21.5%',
        voltage: '41.7V',
        current: '13.2A',
        dimensions: '2278 x 1134 x 35 mm'
      },
      certifications: ['IEC 61215', 'IEC 61730', 'ISO 9001'],
      documents: []
    },
    installationData: {
      installerWalletAddress: sampleWallets.installer2,
      installerName: 'Gupta MEP Services',
      installationDate: new Date('2024-04-01'),
      location: {
        building: 'Building A',
        floor: 'Rooftop',
        room: 'N/A',
        gridReference: 'ROOF-SOLAR-ARRAY'
      },
      installationPhotos: [],
      commissioningDate: new Date('2024-04-10'),
      warrantyStartDate: new Date('2024-04-10'),
      warrantyEndDate: new Date('2049-04-10'),
      maintenanceSchedule: 'Semi-Annual',
      certifications: ['Grid Connection Certificate', 'Electrical Safety Certificate'],
      notes: 'Complete 1.1 MW rooftop solar installation. Grid synchronization successful.'
    },
    enrichmentData: {
      supplierWalletAddress: sampleWallets.supplier2,
      supplierName: 'Mehta Suppliers',
      enrichmentDate: new Date('2024-04-15'),
      environmentalProductDeclaration: {
        carbonFootprint: '1200 kg CO2-eq per panel',
        embodiedEnergy: '2500 MJ per panel',
        recyclableContent: '85%',
        epdDocument: ''
      },
      performanceData: {
        expectedLifespan: '25 years',
        degradationRate: '0.5% per year',
        energyPaybackTime: '2.5 years',
        peakPowerOutput: '550W',
        temperatureCoefficient: '-0.35%/°C'
      },
      certifications: ['PV Module Certification', 'Fire Safety Rating: Class A'],
      documents: [],
      sustainabilityScore: 92
    },
    status: 'enriched',
    createdBy: sampleWallets.contractor2,
    metadata: {
      manufacturer: 'Adani Solar',
      countryOfOrigin: 'India',
      totalSystemCapacity: '1.1 MW'
    }
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await DPP.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Seed projects
    console.log('🏗️  Seeding projects...');
    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} projects\n`);

    // Seed DPPs
    console.log('📦 Seeding DPPs...');
    const createdDPPs = await DPP.insertMany(dpps);
    console.log(`✅ Created ${createdDPPs.length} DPPs\n`);

    // Print summary
    console.log('═══════════════════════════════════════════');
    console.log('✨ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   • Users: ${createdUsers.length}`);
    console.log(`   • Projects: ${createdProjects.length}`);
    console.log(`   • DPPs: ${createdDPPs.length}\n`);
    
    console.log('🔑 Sample Credentials:');
    console.log('   Owner: ' + sampleWallets.owner);
    console.log('   Contractor 1: ' + sampleWallets.contractor1);
    console.log('   Contractor 2: ' + sampleWallets.contractor2);
    console.log('   Installer 1: ' + sampleWallets.installer1);
    console.log('   Installer 2: ' + sampleWallets.installer2);
    console.log('   Supplier 1: ' + sampleWallets.supplier1);
    console.log('   Supplier 2: ' + sampleWallets.supplier2);
    console.log('   Regulator: ' + sampleWallets.regulator);
    console.log('\n⚠️  Remember: These are test addresses only!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
