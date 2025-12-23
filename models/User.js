const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: [true, 'Wallet address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'contractor', 'installer', 'supplier', 'regulator'],
      required: [true, 'Role is required'],
      default: 'contractor',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profileImage: {
      type: String, // IPFS hash or URL
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ walletAddress: 1, role: 1 });
userSchema.index({ email: 1 });
userSchema.index({ company: 1 });

// Virtual for full profile
userSchema.virtual('projectCount').get(function () {
  return this.assignedProjects.length;
});

// Method to update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save();
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
