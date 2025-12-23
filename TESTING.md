# Testing the DPP Backend

This guide will walk you through testing all the major features of the DPP backend.

## Prerequisites

- Backend server running on `http://localhost:5000`
- MongoDB running
- Pinata credentials configured
- Smart contract deployed (optional for initial testing)

## Testing Tools

You can use:
- **cURL** (command line)
- **Postman** (GUI)
- **Thunder Client** (VS Code extension)
- **Insomnia** (API client)

---

## Phase 1: Basic Setup Testing

### 1.1 Health Check

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-23T...",
  "environment": "development"
}
```

### 1.2 Root Endpoint

```bash
curl http://localhost:5000/
```

**Expected:** API information with endpoint list

---

## Phase 2: Authentication Testing

### 2.1 Register Owner

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "owner",
    "name": "Alice Owner",
    "company": "Alpha Developers",
    "email": "alice@example.com"
  }'
```

**Save the token from response!**

### 2.2 Register Contractor

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    "role": "contractor",
    "name": "Bob Contractor",
    "company": "Beta Construction",
    "email": "bob@example.com"
  }'
```

### 2.3 Register Installer

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    "role": "installer",
    "name": "Charlie Installer",
    "company": "Gamma MEP Services",
    "email": "charlie@example.com"
  }'
```

### 2.4 Register Supplier

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    "role": "supplier",
    "name": "Diana Supplier",
    "company": "Delta Materials",
    "email": "diana@example.com"
  }'
```

### 2.5 Login Test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### 2.6 Get Profile

```bash
# Replace <OWNER_TOKEN> with actual token
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

---

## Phase 3: Project Management Testing

### 3.1 Create Project (Owner)

```bash
curl -X POST http://localhost:5000/api/projects/create \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Green Tower Complex",
    "location": {
      "address": "123 Marine Drive",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "pincode": "400001"
    },
    "projectType": "Commercial",
    "totalFloors": 25,
    "zones": ["Zone A", "Zone B", "Zone C"],
    "timeline": {
      "startDate": "2024-01-01",
      "expectedCompletion": "2025-12-31"
    },
    "budget": {
      "estimated": 50000000,
      "currency": "INR"
    },
    "description": "A modern commercial complex with sustainable features"
  }'
```

**Save the projectId from response!**

### 3.2 Get All Projects

```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

### 3.3 Get Project Details

```bash
curl http://localhost:5000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

### 3.4 Add Contractor to Project

```bash
curl -X POST http://localhost:5000/api/projects/<PROJECT_ID>/add-contractor \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
  }'
```

### 3.5 Add Installer to Project

```bash
curl -X POST http://localhost:5000/api/projects/<PROJECT_ID>/add-installer \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"
  }'
```

### 3.6 Add Supplier to Project

```bash
curl -X POST http://localhost:5000/api/projects/<PROJECT_ID>/add-supplier \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E"
  }'
```

---

## Phase 4: File Upload Testing

### 4.1 Upload Single File

Create a test image file first, then:

```bash
curl -X POST http://localhost:5000/api/upload/ipfs \
  -H "Authorization: Bearer <CONTRACTOR_TOKEN>" \
  -F "file=@./test_image.jpg"
```

**Save the ipfsHash from response!**

### 4.2 Upload Multiple Files

```bash
curl -X POST http://localhost:5000/api/upload/ipfs-multiple \
  -H "Authorization: Bearer <INSTALLER_TOKEN>" \
  -F "files=@./doc1.pdf" \
  -F "files=@./doc2.pdf" \
  -F "files=@./photo.jpg"
```

---

## Phase 5: DPP Lifecycle Testing

### 5.1 Create DPP (Contractor - Procurement Phase)

```bash
curl -X POST http://localhost:5000/api/dpp/create \
  -H "Authorization: Bearer <CONTRACTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "<PROJECT_ID>",
    "productName": "Portland Cement - Grade 53",
    "category": "Cement",
    "quantity": 1000,
    "unit": "bag",
    "procurementData": {
      "supplierName": "Ultra Tech Cement",
      "supplierAddress": "Industrial Area, Thane",
      "batchNumber": "UTC-2024-001",
      "deliveryDate": "2024-01-15",
      "deliveryLocation": "Site Storage - Zone A",
      "deliveryPhotoIPFS": "<IPFS_HASH_FROM_UPLOAD>",
      "notes": "Quality checked, all bags intact"
    },
    "metadata": {
      "manufacturer": "Ultra Tech",
      "modelNumber": "OPC-53",
      "batchNumber": "BATCH-001",
      "productionDate": "2023-12-01"
    }
  }'
```

**Save the dppId from response!**

### 5.2 Get DPPs by Project

```bash
curl http://localhost:5000/api/dpp/project/<PROJECT_ID> \
  -H "Authorization: Bearer <CONTRACTOR_TOKEN>"
```

### 5.3 Get DPP Details

```bash
curl http://localhost:5000/api/dpp/<DPP_ID> \
  -H "Authorization: Bearer <CONTRACTOR_TOKEN>"
```

### 5.4 Update Installation (Installer - Installation Phase)

First upload installation photos, then:

```bash
curl -X PUT http://localhost:5000/api/dpp/<DPP_ID>/install \
  -H "Authorization: Bearer <INSTALLER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "installationData": {
      "installationLocation": "Floor 5, Column Grid A3-A5",
      "installationDate": "2024-02-01",
      "installerName": "Charlie Installer",
      "equipmentUsed": "Concrete Mixer, Vibrator",
      "installationPhotosIPFS": ["<IPFS_HASH_1>", "<IPFS_HASH_2>"],
      "commissioningDocsIPFS": ["<IPFS_HASH_3>"],
      "safetyCertificatesIPFS": ["<IPFS_HASH_4>"],
      "notes": "Installation completed as per specifications"
    }
  }'
```

### 5.5 Enrich DPP (Supplier - Enrichment Phase)

First upload technical documents, then:

```bash
curl -X PUT http://localhost:5000/api/dpp/<DPP_ID>/enrich \
  -H "Authorization: Bearer <SUPPLIER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "enrichmentData": {
      "epdDocumentIPFS": "<EPD_IPFS_HASH>",
      "fireRatingCertIPFS": "<FIRE_CERT_IPFS_HASH>",
      "technicalSpecsIPFS": "<TECH_SPECS_IPFS_HASH>",
      "warrantyDocIPFS": "<WARRANTY_IPFS_HASH>",
      "maintenanceManualIPFS": "<MANUAL_IPFS_HASH>",
      "notes": "All technical documentation provided"
    }
  }'
```

### 5.6 Verify DPP (Public - No Auth)

```bash
curl http://localhost:5000/api/dpp/<DPP_ID>/verify
```

### 5.7 Get Blockchain Proof

```bash
curl http://localhost:5000/api/dpp/<DPP_ID>/blockchain-proof
```

---

## Phase 6: Dashboard Testing

### 6.1 Owner Dashboard

```bash
curl http://localhost:5000/api/dashboard/owner/<PROJECT_ID> \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

### 6.2 Contractor Dashboard

```bash
curl http://localhost:5000/api/dashboard/contractor \
  -H "Authorization: Bearer <CONTRACTOR_TOKEN>"
```

### 6.3 Installer Dashboard

```bash
curl http://localhost:5000/api/dashboard/installer \
  -H "Authorization: Bearer <INSTALLER_TOKEN>"
```

### 6.4 Supplier Dashboard

```bash
curl http://localhost:5000/api/dashboard/supplier \
  -H "Authorization: Bearer <SUPPLIER_TOKEN>"
```

---

## Phase 7: Search and Filter Testing

### 7.1 Search DPPs

```bash
curl "http://localhost:5000/api/dpp/search?query=cement&category=Cement&status=created" \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

### 7.2 Filter Projects

```bash
curl "http://localhost:5000/api/projects?status=active&projectType=Commercial&page=1&limit=10" \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

---

## Phase 8: Error Testing

### 8.1 Test Unauthorized Access

```bash
# Try to create project without token
curl -X POST http://localhost:5000/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test"}'
```

**Expected:** 401 Unauthorized

### 8.2 Test Wrong Role

```bash
# Try to create DPP with owner token (only contractors can)
curl -X POST http://localhost:5000/api/dpp/create \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected:** 403 Forbidden

### 8.3 Test Validation Errors

```bash
# Try to register with invalid data
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "invalid-address",
    "role": "invalid-role"
  }'
```

**Expected:** 400 Bad Request with validation errors

---

## Automated Testing Script

Create a file `test.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo "🧪 Starting DPP Backend Tests..."

# Test 1: Health Check
echo -e "\n${GREEN}Test 1: Health Check${NC}"
curl -s $BASE_URL/health | jq .

# Test 2: Register Owner
echo -e "\n${GREEN}Test 2: Register Owner${NC}"
OWNER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "owner",
    "name": "Test Owner"
  }')

OWNER_TOKEN=$(echo $OWNER_RESPONSE | jq -r '.data.token')
echo "Owner Token: $OWNER_TOKEN"

# Test 3: Create Project
echo -e "\n${GREEN}Test 3: Create Project${NC}"
PROJECT_RESPONSE=$(curl -s -X POST $BASE_URL/api/projects/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "projectType": "Commercial",
    "location": {"city": "Mumbai"}
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.data.project.projectId')
echo "Project ID: $PROJECT_ID"

# Add more tests...

echo -e "\n${GREEN}✅ All tests completed!${NC}"
```

Run with:
```bash
chmod +x test.sh
./test.sh
```

---

## Testing Checklist

- [ ] Health check passes
- [ ] Can register users of all roles
- [ ] Can login and receive JWT token
- [ ] Owner can create projects
- [ ] Owner can add team members
- [ ] Can upload files to IPFS
- [ ] Contractor can create DPPs
- [ ] Installer can update installations
- [ ] Supplier can enrich DPPs
- [ ] Public can verify DPPs
- [ ] Dashboards return correct data
- [ ] Search and filters work
- [ ] Unauthorized requests are blocked
- [ ] Wrong roles are rejected
- [ ] Validation errors are caught
- [ ] Blockchain integration works (if configured)

---

## Common Issues During Testing

### Issue: Token Expired
**Solution:** Re-login to get a new token

### Issue: Project Not Found
**Solution:** Ensure you're using the correct projectId

### Issue: Not Authorized
**Solution:** Check if user is added to project team

### Issue: IPFS Upload Failed
**Solution:** Verify Pinata credentials

### Issue: Validation Errors
**Solution:** Check request body matches schema

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Install Apache Bench
apt-get install apache2-utils  # Linux
brew install httpd              # macOS

# Test health endpoint
ab -n 1000 -c 10 http://localhost:5000/health

# Test with authentication
ab -n 100 -c 5 -H "Authorization: Bearer <TOKEN>" \
  http://localhost:5000/api/projects
```

---

## Next Steps

After successful testing:

1. ✅ Deploy smart contract
2. ✅ Update CONTRACT_ADDRESS in .env
3. ✅ Test blockchain integration
4. ✅ Set up production environment
5. ✅ Configure monitoring
6. ✅ Create backup strategy

---

**Happy Testing! 🧪**
