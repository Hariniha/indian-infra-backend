const mongoose = require('mongoose');

const dppSchema = new mongoose.Schema(
  {
    dppId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    projectId: {
      type: String,
      required: [true, 'Project ID is required'],
      ref: 'Project',
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Cement',
        'Steel',
        'Bricks',
        'Sand',
        'Aggregate',
        'Glass',
        'Tiles',
        'Paint',
        'Electrical',
        'Plumbing',
        'HVAC',
        'Doors',
        'Windows',
        'Roofing',
        'Insulation',
        'Flooring',
        'Hardware',
        'Other',
      ],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'ton', 'piece', 'box', 'bag', 'sqft', 'sqm', 'meter', 'liter', 'other'],
    },
    qrCode: {
      type: String,
      unique: true,
      required: true,
    },

    // ==================== PROCUREMENT PHASE ====================
    procurementData: {
      supplierName: {
        type: String,
        trim: true,
      },
      supplierAddress: {
        type: String,
        trim: true,
      },
      batchNumber: {
        type: String,
        trim: true,
      },
      deliveryDate: {
        type: Date,
      },
      deliveryLocation: {
        type: String,
        trim: true,
      },
      contractorWalletAddress: {
        type: String,
        lowercase: true,
        ref: 'User',
      },
      deliveryPhotoIPFS: {
        type: String,
        trim: true,
      },
      procurementBlockchainTxHash: {
        type: String,
        trim: true,
      },
      procurementTimestamp: {
        type: Date,
      },
      notes: {
        type: String,
        trim: true,
      },
    },

    // ==================== INSTALLATION PHASE ====================
    installationData: {
      installationLocation: {
        type: String,
        trim: true,
      },
      installationDate: {
        type: Date,
      },
      installerName: {
        type: String,
        trim: true,
      },
      installerWalletAddress: {
        type: String,
        lowercase: true,
        ref: 'User',
      },
      equipmentUsed: {
        type: String,
        trim: true,
      },
      commissioningDocsIPFS: [
        {
          type: String,
          trim: true,
        },
      ],
      safetyCertificatesIPFS: [
        {
          type: String,
          trim: true,
        },
      ],
      installationPhotosIPFS: [
        {
          type: String,
          trim: true,
        },
      ],
      installationBlockchainTxHash: {
        type: String,
        trim: true,
      },
      installationTimestamp: {
        type: Date,
      },
      notes: {
        type: String,
        trim: true,
      },
    },

    // ==================== ENRICHMENT PHASE ====================
    enrichmentData: {
      supplierWalletAddress: {
        type: String,
        lowercase: true,
        ref: 'User',
      },
      epdDocumentIPFS: {
        type: String,
        trim: true,
      },
      fireRatingCertIPFS: {
        type: String,
        trim: true,
      },
      technicalSpecsIPFS: {
        type: String,
        trim: true,
      },
      warrantyDocIPFS: {
        type: String,
        trim: true,
      },
      maintenanceManualIPFS: {
        type: String,
        trim: true,
      },
      enrichmentBlockchainTxHash: {
        type: String,
        trim: true,
      },
      enrichmentTimestamp: {
        type: Date,
      },
      notes: {
        type: String,
        trim: true,
      },
    },

    // ==================== STATUS TRACKING ====================
    status: {
      type: String,
      enum: ['created', 'installed', 'enriched', 'verified', 'inactive'],
      default: 'created',
      index: true,
    },
    documentCompleteness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    complianceStatus: {
      type: Boolean,
      default: false,
    },

    // ==================== METADATA ====================
    metadata: {
      manufacturer: String,
      modelNumber: String,
      serialNumber: String,
      batchNumber: String,
      productionDate: Date,
      expiryDate: Date,
      certifications: [String],
    },

    // ==================== VERIFICATION ====================
    verificationHistory: [
      {
        verifiedBy: String,
        verifiedAt: Date,
        notes: String,
      },
    ],

    // ==================== TAGS & SEARCH ====================
    tags: [String],
    searchText: String, // For full-text search
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
dppSchema.index({ dppId: 1 });
dppSchema.index({ projectId: 1, status: 1 });
dppSchema.index({ 'procurementData.contractorWalletAddress': 1 });
dppSchema.index({ 'installationData.installerWalletAddress': 1 });
dppSchema.index({ 'enrichmentData.supplierWalletAddress': 1 });
dppSchema.index({ category: 1 });
dppSchema.index({ createdAt: -1 });
dppSchema.index({ status: 1, projectId: 1 });
dppSchema.index({ searchText: 'text' });

// Pre-save middleware to generate DPP ID
dppSchema.pre('save', async function (next) {
  if (!this.dppId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.dppId = `DPP-${this.projectId}-${timestamp}-${random}`;
  }

  // Update search text for full-text search
  this.searchText = `${this.productName} ${this.category} ${this.dppId} ${
    this.procurementData?.supplierName || ''
  }`;

  // Calculate document completeness
  this.documentCompleteness = this.calculateCompleteness();

  next();
});

// Method to calculate document completeness percentage
dppSchema.methods.calculateCompleteness = function () {
  let totalFields = 0;
  let completedFields = 0;

  // Procurement phase (30%)
  const procurementFields = [
    'supplierName',
    'supplierAddress',
    'batchNumber',
    'deliveryDate',
    'deliveryLocation',
    'deliveryPhotoIPFS',
  ];
  procurementFields.forEach((field) => {
    totalFields++;
    if (this.procurementData?.[field]) completedFields++;
  });

  // Installation phase (30%)
  const installationFields = [
    'installationLocation',
    'installationDate',
    'installerName',
  ];
  installationFields.forEach((field) => {
    totalFields++;
    if (this.installationData?.[field]) completedFields++;
  });

  if (
    this.installationData?.installationPhotosIPFS?.length > 0 ||
    this.installationData?.commissioningDocsIPFS?.length > 0
  ) {
    completedFields++;
  }
  totalFields++;

  // Enrichment phase (40%)
  const enrichmentFields = [
    'epdDocumentIPFS',
    'fireRatingCertIPFS',
    'technicalSpecsIPFS',
    'warrantyDocIPFS',
    'maintenanceManualIPFS',
  ];
  enrichmentFields.forEach((field) => {
    totalFields++;
    if (this.enrichmentData?.[field]) completedFields++;
  });

  return Math.round((completedFields / totalFields) * 100);
};

// Method to get all blockchain transaction hashes
dppSchema.methods.getBlockchainProof = function () {
  return {
    dppId: this.dppId,
    transactions: {
      procurement: this.procurementData?.procurementBlockchainTxHash || null,
      installation: this.installationData?.installationBlockchainTxHash || null,
      enrichment: this.enrichmentData?.enrichmentBlockchainTxHash || null,
    },
    ipfsHashes: {
      deliveryPhoto: this.procurementData?.deliveryPhotoIPFS || null,
      installationPhotos: this.installationData?.installationPhotosIPFS || [],
      commissioningDocs: this.installationData?.commissioningDocsIPFS || [],
      safetyCertificates: this.installationData?.safetyCertificatesIPFS || [],
      epdDocument: this.enrichmentData?.epdDocumentIPFS || null,
      fireRatingCert: this.enrichmentData?.fireRatingCertIPFS || null,
      technicalSpecs: this.enrichmentData?.technicalSpecsIPFS || null,
      warrantyDoc: this.enrichmentData?.warrantyDocIPFS || null,
      maintenanceManual: this.enrichmentData?.maintenanceManualIPFS || null,
    },
  };
};

// Virtual to populate project details
dppSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: 'projectId',
  justOne: true,
});

module.exports = mongoose.model('DPP', dppSchema);
