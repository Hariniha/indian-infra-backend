const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: [true, 'Project ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    projectType: {
      type: String,
      enum: [
        'Residential',
        'Commercial',
        'Industrial',
        'Infrastructure',
        'Mixed-Use',
        'Other',
      ],
      required: true,
    },
    totalFloors: {
      type: Number,
      min: 0,
    },
    zones: [
      {
        type: String,
        trim: true,
      },
    ],
    ownerWalletAddress: {
      type: String,
      required: [true, 'Owner wallet address is required'],
      lowercase: true,
      ref: 'User',
    },
    authorizedContractors: [
      {
        walletAddress: {
          type: String,
          lowercase: true,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    authorizedInstallers: [
      {
        walletAddress: {
          type: String,
          lowercase: true,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    authorizedSuppliers: [
      {
        walletAddress: {
          type: String,
          lowercase: true,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    blockchainTxHash: {
      type: String,
      trim: true,
    },
    ipfsHash: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      unique: true,
    },
    timeline: {
      startDate: {
        type: Date,
      },
      expectedCompletion: {
        type: Date,
      },
      actualCompletion: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold', 'cancelled'],
      default: 'active',
    },
    budget: {
      estimated: Number,
      actual: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    documents: [
      {
        name: String,
        ipfsHash: String,
        uploadedBy: String,
        uploadedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ projectId: 1 });
projectSchema.index({ ownerWalletAddress: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'authorizedContractors.walletAddress': 1 });
projectSchema.index({ 'authorizedInstallers.walletAddress': 1 });
projectSchema.index({ 'authorizedSuppliers.walletAddress': 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for total DPPs count
projectSchema.virtual('dppCount', {
  ref: 'DPP',
  localField: 'projectId',
  foreignField: 'projectId',
  count: true,
});

// Method to check if user is authorized
projectSchema.methods.isUserAuthorized = function (walletAddress, role) {
  walletAddress = walletAddress.toLowerCase();
  
  if (this.ownerWalletAddress === walletAddress) {
    return true;
  }

  switch (role) {
    case 'contractor':
      return this.authorizedContractors.some(
        (c) => c.walletAddress === walletAddress
      );
    case 'installer':
      return this.authorizedInstallers.some(
        (i) => i.walletAddress === walletAddress
      );
    case 'supplier':
      return this.authorizedSuppliers.some(
        (s) => s.walletAddress === walletAddress
      );
    default:
      return false;
  }
};

// Pre-save middleware to generate project ID if not provided
projectSchema.pre('save', async function (next) {
  if (!this.projectId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.projectId = `PRJ-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
