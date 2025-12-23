# API Endpoints Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔐 Auth Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "walletAddress": "0x...",
  "role": "contractor|installer|supplier|owner|regulator",
  "name": "John Doe",
  "company": "ABC Corp",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message"
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Check Wallet
```http
POST /api/auth/check-wallet
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

---

## 🏗️ Project Endpoints

### Create Project (Owner only)
```http
POST /api/projects/create
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "projectName": "Green Tower",
  "location": {
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "pincode": "400001"
  },
  "projectType": "Commercial|Residential|Industrial|Infrastructure|Mixed-Use|Other",
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
  "description": "Project description"
}
```

### Get All Projects
```http
GET /api/projects?page=1&limit=10&status=active&projectType=Commercial
Authorization: Bearer <token>
```

### Get Project Details
```http
GET /api/projects/:projectId
Authorization: Bearer <token>
```

### Update Project (Owner only)
```http
PUT /api/projects/:projectId
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "projectName": "Updated Name",
  "status": "active|completed|on-hold|cancelled"
}
```

### Add Contractor (Owner only)
```http
POST /api/projects/:projectId/add-contractor
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

### Add Installer (Owner only)
```http
POST /api/projects/:projectId/add-installer
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

### Add Supplier (Owner only)
```http
POST /api/projects/:projectId/add-supplier
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

### Get Project Statistics
```http
GET /api/projects/:projectId/stats
Authorization: Bearer <token>
```

---

## 📦 DPP Endpoints

### Create DPP (Contractor only)
```http
POST /api/dpp/create
Authorization: Bearer <contractor-token>
Content-Type: application/json

{
  "projectId": "PRJ-123...",
  "productName": "Cement Grade 53",
  "category": "Cement|Steel|Bricks|Sand|...",
  "quantity": 1000,
  "unit": "bag|kg|ton|piece|box|sqft|sqm|meter|liter",
  "procurementData": {
    "supplierName": "XYZ Cement",
    "supplierAddress": "456 Industrial Area",
    "batchNumber": "BATCH-001",
    "deliveryDate": "2024-01-15",
    "deliveryLocation": "Floor 5, Zone A",
    "deliveryPhotoIPFS": "QmXxx...",
    "notes": "Optional notes"
  },
  "metadata": {
    "manufacturer": "XYZ Corp",
    "modelNumber": "C53-2024",
    "serialNumber": "SN-123",
    "productionDate": "2023-12-01"
  }
}
```

### Get DPPs by Project
```http
GET /api/dpp/project/:projectId?page=1&limit=20&status=created&category=Cement
Authorization: Bearer <token>
```

### Get DPP Details
```http
GET /api/dpp/:dppId
Authorization: Bearer <token>
```

### Update Installation (Installer only)
```http
PUT /api/dpp/:dppId/install
Authorization: Bearer <installer-token>
Content-Type: application/json

{
  "installationData": {
    "installationLocation": "Floor 5, Room 501",
    "installationDate": "2024-02-01",
    "installerName": "Mike Johnson",
    "equipmentUsed": "Crane, Mixer",
    "installationPhotosIPFS": ["QmAbc...", "QmDef..."],
    "commissioningDocsIPFS": ["QmGhi..."],
    "safetyCertificatesIPFS": ["QmJkl..."],
    "notes": "Installation notes"
  }
}
```

### Enrich DPP (Supplier only)
```http
PUT /api/dpp/:dppId/enrich
Authorization: Bearer <supplier-token>
Content-Type: application/json

{
  "enrichmentData": {
    "epdDocumentIPFS": "QmEpd...",
    "fireRatingCertIPFS": "QmFire...",
    "technicalSpecsIPFS": "QmTech...",
    "warrantyDocIPFS": "QmWarranty...",
    "maintenanceManualIPFS": "QmManual...",
    "notes": "Enrichment notes"
  }
}
```

### Verify DPP (Public)
```http
GET /api/dpp/:dppId/verify
# No authentication required
```

### Get Blockchain Proof
```http
GET /api/dpp/:dppId/blockchain-proof
# Can be public or authenticated
```

### Search DPPs
```http
GET /api/dpp/search?query=cement&category=Cement&status=created&projectId=PRJ-123&page=1&limit=20
Authorization: Bearer <token>
```

---

## 📤 Upload Endpoints

### Upload Single File
```http
POST /api/upload/ipfs
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  file: <file>
```

### Upload Multiple Files
```http
POST /api/upload/ipfs-multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  files: <file1>
  files: <file2>
  files: <file3>
```

### Get IPFS URL
```http
GET /api/upload/ipfs-url/:cid
# No authentication required
```

### Retrieve from IPFS
```http
GET /api/upload/ipfs/:cid
# No authentication required
```

---

## 📊 Dashboard Endpoints

### Owner Dashboard
```http
GET /api/dashboard/owner/:projectId
Authorization: Bearer <owner-token>
```

### Contractor Dashboard
```http
GET /api/dashboard/contractor
Authorization: Bearer <contractor-token>
```

### Installer Dashboard
```http
GET /api/dashboard/installer
Authorization: Bearer <installer-token>
```

### Supplier Dashboard
```http
GET /api/dashboard/supplier
Authorization: Bearer <supplier-token>
```

### Regulator Dashboard
```http
GET /api/dashboard/regulator
Authorization: Bearer <regulator-token>
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "results": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🔑 Query Parameters

### Common Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status
- `category` - Filter by category
- `projectType` - Filter by project type
- `query` - Search query text

---

## 📝 Field Validations

### Wallet Address
- Must be valid Ethereum address (0x...)
- Case insensitive

### Role
- Must be one of: owner, contractor, installer, supplier, regulator

### Project Type
- Must be one of: Residential, Commercial, Industrial, Infrastructure, Mixed-Use, Other

### DPP Category
- Must be one of: Cement, Steel, Bricks, Sand, Aggregate, Glass, Tiles, Paint, Electrical, Plumbing, HVAC, Doors, Windows, Roofing, Insulation, Flooring, Hardware, Other

### Unit
- Must be one of: kg, ton, piece, box, bag, sqft, sqm, meter, liter, other

### File Upload
- Max size: 10MB per file
- Allowed types: JPEG, PNG, PDF, DOC, DOCX

---

## 🔄 Status Flow

### Project Status
```
active → completed
active → on-hold → active
active → cancelled
```

### DPP Status
```
created → installed → enriched → verified
```

---

## 🚨 Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 💡 Tips

1. **Always include Authorization header** for protected routes
2. **Use pagination** for large datasets
3. **Upload files first**, then use IPFS hash in DPP creation
4. **Check user role** before attempting restricted operations
5. **Handle rate limits** - implement retry logic with backoff
6. **Verify transactions** using blockchain-proof endpoint

---

## 🧪 Testing Tips

### Using cURL
```bash
# Set token variable
TOKEN="your-jwt-token-here"

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```

### Using Postman
1. Import endpoints as collection
2. Set environment variable for token
3. Use {{token}} in Authorization header

---

**Last Updated:** December 2024
