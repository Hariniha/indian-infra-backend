# Digital Product Passport (DPP) Backend API

A comprehensive Node.js + Express + MongoDB backend for a blockchain-based Digital Product Passport system in the AEC (Architecture, Engineering, and Construction) industry.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Support for Owner, Contractor, Installer, Supplier, and Regulator roles
- **IPFS Integration**: Decentralized file storage using Pinata
- **Blockchain Integration**: Ethereum smart contract interaction using ethers.js
- **JWT Authentication**: Secure wallet-based authentication
- **DPP Lifecycle Management**: Create, Install, Enrich, and Verify digital product passports
- **QR Code Generation**: Unique QR codes for each DPP for easy verification
- **RESTful API**: Clean and well-documented API endpoints
- **File Upload**: Secure file upload with validation and size limits
- **Dashboard Analytics**: Role-specific dashboards with statistics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the repository (if applicable)

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dpp-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# IPFS Configuration (Pinata)
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret-key
PINATA_JWT=your-pinata-jwt-token
PINATA_GATEWAY=https://gateway.pinata.cloud

# Ethereum Blockchain Configuration
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your-project-id
CONTRACT_ADDRESS=0x...your-deployed-contract-address
PRIVATE_KEY=your-deployer-private-key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. Run the server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 🔑 Getting Started

### Step 1: Get Pinata API Credentials

1. Sign up at [Pinata Cloud](https://www.pinata.cloud/)
2. Create a new API key
3. Copy the API Key, Secret Key, and JWT
4. Add them to your `.env` file

### Step 2: Get Ethereum RPC URL

1. Sign up at [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
2. Create a new project
3. Copy the RPC URL for your desired network (e.g., Sepolia testnet)
4. Add it to your `.env` file

### Step 3: Deploy Smart Contract

You mentioned the smart contract is deployed via Remix IDE. After deployment:

1. Copy the deployed contract address
2. Add it to `.env` as `CONTRACT_ADDRESS`
3. The ABI is already defined in `services/blockchainService.js`
4. **Update the ABI in `blockchainService.js` to match your deployed contract**

### Step 4: Test the API

Use the health check endpoint:

```bash
curl http://localhost:5000/health
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

### 1. Register User

**POST** `/api/auth/register`

Register a new user with wallet address.

**Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "role": "contractor",
  "name": "John Doe",
  "company": "ABC Construction",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### 2. Login

**POST** `/api/auth/login`

Login with wallet address and optional signature verification.

**Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "message": "Sign this message to login"
}
```

### 3. Get Profile

**GET** `/api/auth/profile`

Get current user's profile. (Protected)

### 4. Update Profile

**PUT** `/api/auth/profile`

Update user profile. (Protected)

---

## 🏗️ Project Routes (`/api/projects`)

### 1. Create Project

**POST** `/api/projects/create`

Create a new project. (Owner only)

**Body:**
```json
{
  "projectName": "Green Tower Complex",
  "location": {
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "pincode": "400001"
  },
  "projectType": "Commercial",
  "totalFloors": 25,
  "zones": ["Zone A", "Zone B"],
  "timeline": {
    "startDate": "2024-01-01",
    "expectedCompletion": "2025-12-31"
  },
  "budget": {
    "estimated": 50000000,
    "currency": "INR"
  },
  "description": "A modern commercial complex"
}
```

### 2. Get All Projects

**GET** `/api/projects?page=1&limit=10&status=active`

Get all projects (filtered by user role).

### 3. Get Project Details

**GET** `/api/projects/:projectId`

Get detailed information about a specific project.

### 4. Update Project

**PUT** `/api/projects/:projectId`

Update project details. (Owner only)

### 5. Add Contractor

**POST** `/api/projects/:projectId/add-contractor`

Add a contractor to the project. (Owner only)

**Body:**
```json
{
  "walletAddress": "0x..."
}
```

### 6. Add Installer

**POST** `/api/projects/:projectId/add-installer`

### 7. Add Supplier

**POST** `/api/projects/:projectId/add-supplier`

### 8. Get Project Statistics

**GET** `/api/projects/:projectId/stats`

Get detailed statistics for a project.

---

## 📦 DPP Routes (`/api/dpp`)

### 1. Create DPP (Procurement Phase)

**POST** `/api/dpp/create`

Create a new Digital Product Passport. (Contractor only)

**Body:**
```json
{
  "projectId": "PRJ-1234567890-ABCD",
  "productName": "Cement - Grade 53",
  "category": "Cement",
  "quantity": 1000,
  "unit": "bag",
  "procurementData": {
    "supplierName": "XYZ Cement Co.",
    "supplierAddress": "456 Industrial Area",
    "batchNumber": "BATCH-2024-001",
    "deliveryDate": "2024-01-15",
    "deliveryLocation": "Floor 5, Zone A",
    "deliveryPhotoIPFS": "QmXxx...",
    "notes": "Quality checked and verified"
  },
  "metadata": {
    "manufacturer": "XYZ Cement",
    "modelNumber": "C53-2024",
    "productionDate": "2023-12-01"
  }
}
```

### 2. Get DPPs by Project

**GET** `/api/dpp/project/:projectId?page=1&limit=20&status=created&category=Cement`

Get all DPPs for a specific project.

### 3. Get DPP Details

**GET** `/api/dpp/:dppId`

Get detailed information about a specific DPP.

### 4. Update Installation (Installation Phase)

**PUT** `/api/dpp/:dppId/install`

Update DPP with installation data. (Installer only)

**Body:**
```json
{
  "installationData": {
    "installationLocation": "Floor 5, Room 501",
    "installationDate": "2024-02-01",
    "installerName": "Mike Johnson",
    "equipmentUsed": "Crane, Mixer",
    "installationPhotosIPFS": ["QmAbc...", "QmDef..."],
    "commissioningDocsIPFS": ["QmGhi..."],
    "safetyCertificatesIPFS": ["QmJkl..."],
    "notes": "Installation completed successfully"
  }
}
```

### 5. Enrich DPP (Enrichment Phase)

**PUT** `/api/dpp/:dppId/enrich`

Enrich DPP with technical documentation. (Supplier only)

**Body:**
```json
{
  "enrichmentData": {
    "epdDocumentIPFS": "QmEpd...",
    "fireRatingCertIPFS": "QmFire...",
    "technicalSpecsIPFS": "QmTech...",
    "warrantyDocIPFS": "QmWarranty...",
    "maintenanceManualIPFS": "QmManual...",
    "notes": "All technical documents uploaded"
  }
}
```

### 6. Verify DPP (Public)

**GET** `/api/dpp/:dppId/verify`

Verify DPP authenticity (accessible via QR code scan). Public endpoint.

### 7. Get Blockchain Proof

**GET** `/api/dpp/:dppId/blockchain-proof`

Get all blockchain transaction hashes for a DPP.

### 8. Search DPPs

**GET** `/api/dpp/search?query=cement&category=Cement&status=created`

Search DPPs with filters.

---

## 📤 Upload Routes (`/api/upload`)

### 1. Upload Single File

**POST** `/api/upload/ipfs`

Upload a single file to IPFS.

**Form Data:**
- `file`: File to upload

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "ipfsHash": "QmXxx...",
    "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmXxx...",
    "fileName": "document.pdf",
    "fileSize": 102400,
    "mimeType": "application/pdf"
  }
}
```

### 2. Upload Multiple Files

**POST** `/api/upload/ipfs-multiple`

Upload multiple files to IPFS.

**Form Data:**
- `files`: Multiple files

### 3. Get IPFS URL

**GET** `/api/upload/ipfs-url/:cid`

Get gateway URL for an IPFS CID.

---

## 📊 Dashboard Routes (`/api/dashboard`)

### 1. Owner Dashboard

**GET** `/api/dashboard/owner/:projectId`

Get comprehensive dashboard for project owner.

### 2. Contractor Dashboard

**GET** `/api/dashboard/contractor`

Get contractor's dashboard with DPP creation history.

### 3. Installer Dashboard

**GET** `/api/dashboard/installer`

Get installer's dashboard with installation records.

### 4. Supplier Dashboard

**GET** `/api/dashboard/supplier`

Get supplier's dashboard with enrichment tasks.

### 5. Regulator Dashboard

**GET** `/api/dashboard/regulator`

Get regulator's overview of all projects and DPPs.

---

## 🔒 Role-Based Permissions

| Role | Create Project | Create DPP | Update Installation | Enrich DPP | View All |
|------|---------------|------------|---------------------|------------|----------|
| **Owner** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Contractor** | ❌ | ✅ | ❌ | ❌ | Own only |
| **Installer** | ❌ | ❌ | ✅ | ❌ | Own only |
| **Supplier** | ❌ | ❌ | ❌ | ✅ | Own only |
| **Regulator** | ❌ | ❌ | ❌ | ❌ | Public read |

---

## 🔄 Complete Workflow Example

### Workflow: Creating and Managing a DPP

#### 1. Owner Creates Project
```bash
POST /api/projects/create
Authorization: Bearer <owner-token>
```

#### 2. Owner Adds Contractor
```bash
POST /api/projects/PRJ-123/add-contractor
Authorization: Bearer <owner-token>
Body: { "walletAddress": "0xContractor..." }
```

#### 3. Contractor Uploads Delivery Photo
```bash
POST /api/upload/ipfs
Authorization: Bearer <contractor-token>
Form: file=delivery_photo.jpg
```

#### 4. Contractor Creates DPP
```bash
POST /api/dpp/create
Authorization: Bearer <contractor-token>
Body: { projectId, productName, procurementData: { deliveryPhotoIPFS: "QmXxx..." } }
```

#### 5. Owner Adds Installer
```bash
POST /api/projects/PRJ-123/add-installer
```

#### 6. Installer Uploads Installation Docs
```bash
POST /api/upload/ipfs-multiple
Authorization: Bearer <installer-token>
```

#### 7. Installer Updates Installation
```bash
PUT /api/dpp/DPP-123/install
Authorization: Bearer <installer-token>
```

#### 8. Supplier Enriches DPP
```bash
PUT /api/dpp/DPP-123/enrich
Authorization: Bearer <supplier-token>
```

#### 9. Public Verification
```bash
GET /api/dpp/DPP-123/verify
(No authentication required)
```

---

## 🧪 Testing

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "contractor",
    "name": "John Doe"
  }'
```

### Using Postman

A Postman collection will be provided for easy API testing.

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── jwt.js               # JWT configuration
│   ├── blockchain.js        # Blockchain configuration
│   └── ipfs.js             # IPFS/Pinata configuration
├── models/
│   ├── User.js             # User schema
│   ├── Project.js          # Project schema
│   └── DPP.js              # DPP schema
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── projectController.js # Project management
│   ├── dppController.js    # DPP lifecycle management
│   ├── uploadController.js # File upload handling
│   └── dashboardController.js # Dashboard data
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── dppRoutes.js
│   ├── uploadRoutes.js
│   └── dashboardRoutes.js
├── middleware/
│   ├── auth.js             # JWT & wallet verification
│   ├── rbac.js             # Role-based access control
│   ├── errorHandler.js     # Global error handling
│   └── rateLimiter.js      # Rate limiting
├── services/
│   ├── ipfsService.js      # IPFS operations
│   └── blockchainService.js # Smart contract interaction
├── utils/
│   ├── qrCodeGenerator.js  # QR code generation
│   ├── validators.js       # Input validation
│   ├── fileUpload.js       # File upload utilities
│   └── helpers.js          # Helper functions
├── .env.example
├── .gitignore
├── package.json
└── server.js               # Main application entry
```

---

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongoDB connection error`

**Solution:**
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Verify network connectivity

### IPFS Upload Failures

**Problem:** `Failed to upload file to IPFS`

**Solution:**
1. Verify Pinata credentials in `.env`
2. Check file size limits
3. Ensure internet connectivity

### Blockchain Transaction Failures

**Problem:** `Failed to create project on blockchain`

**Solution:**
1. Verify `CONTRACT_ADDRESS` is set
2. Check `PRIVATE_KEY` has funds (for testnets, use faucets)
3. Ensure RPC URL is correct
4. Note: Blockchain errors are non-critical; operations continue without them

---

## 🔐 Security Considerations

1. **Never commit `.env` file** to version control
2. **Use strong JWT secrets** in production
3. **Keep private keys secure** - never expose them
4. **Enable HTTPS** in production
5. **Regularly update dependencies**
6. **Implement rate limiting** (already configured)
7. **Validate all user inputs** (already implemented)
8. **Use MongoDB authentication** in production

---

## 📈 Performance Optimization

- **Database Indexing**: All critical fields are indexed
- **Compression**: Gzip compression enabled
- **Rate Limiting**: Prevents abuse
- **Connection Pooling**: MongoDB uses connection pooling
- **Caching**: Consider implementing Redis for frequently accessed data

---

## 🚀 Deployment

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dpp-system
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Platforms

- **Heroku**
- **AWS EC2**
- **DigitalOcean**
- **Vercel** (serverless)
- **Railway**

---

## 📝 Smart Contract Integration

**Important:** After deploying your smart contract in Remix:

1. Copy the contract address
2. Update `.env`:
   ```
   CONTRACT_ADDRESS=0xYourContractAddressHere
   ```
3. Update the ABI in `services/blockchainService.js` with your contract's ABI
4. The ABI should match your deployed contract's interface

**Contract Functions Expected:**
- `createProject(projectId, metadataIPFS)`
- `mintDPP(dppId, projectId, metadataIPFS)`
- `updateInstallation(dppId, installationMetadataIPFS)`
- `enrichDPP(dppId, enrichmentMetadataIPFS)`
- `getDPP(dppId)`
- `verifyDPP(dppId)`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## 📄 License

MIT License

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

## ✅ Checklist Before Going Live

- [ ] Update all environment variables for production
- [ ] Deploy smart contract and update `CONTRACT_ADDRESS`
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure Pinata for production use
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Test all API endpoints
- [ ] Review security configurations
- [ ] Set up backup strategy for database
- [ ] Configure CORS for production domain

---

**Happy Building! 🚀**
