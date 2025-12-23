# ⚡ Quick Start Guide - Get Running in 10 Minutes

This guide will get your DPP backend running quickly.

## Prerequisites
- Node.js v18+ installed
- MongoDB installed and running
- Internet connection

---

## Step 1: Install Dependencies (2 minutes)

```bash
cd backend
npm install
```

---

## Step 2: Quick Environment Setup (3 minutes)

Create `.env` file:

```bash
# Copy template
cp .env.example .env
```

**Minimum required configuration for local testing:**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/dpp-system

# JWT Secret (generate one)
JWT_SECRET=your-secret-key-here-change-this

# IPFS (get from Pinata.cloud - free tier)
PINATA_JWT=your-pinata-jwt-here

# Blockchain (optional for initial testing)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your-key
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Get Pinata JWT (2 minutes):
1. Go to https://www.pinata.cloud/
2. Sign up (free)
3. API Keys → Create API Key
4. Copy JWT token
5. Paste in .env as `PINATA_JWT`

---

## Step 3: Start MongoDB (1 minute)

**Windows:**
```powershell
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Docker (if you prefer):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Step 4: Start the Server (1 minute)

```bash
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 DPP Backend Server Running                          ║
║                                                          ║
║   Environment: development                               ║
║   Port: 5000                                             ║
║   URL: http://localhost:5000                             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

MongoDB Connected: localhost
```

---

## Step 5: Test the API (3 minutes)

### 5.1 Health Check
```bash
curl http://localhost:5000/health
```

**Expected:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### 5.2 Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "owner",
    "name": "Test Owner",
    "company": "Test Company"
  }'
```

**Save the token from the response!**

### 5.3 Create a Project
```bash
curl -X POST http://localhost:5000/api/projects/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "projectType": "Commercial",
    "location": {
      "city": "Mumbai",
      "country": "India"
    }
  }'
```

---

## ✅ You're Running!

If all tests passed, your backend is working!

---

## 🎯 What Works Without Blockchain

Even without deploying a smart contract, you can use:

✅ All authentication features
✅ Project management
✅ DPP creation
✅ File uploads to IPFS
✅ Installation updates
✅ Enrichment
✅ QR verification
✅ Dashboards
✅ Search and filtering

❌ Only blockchain transactions will be skipped (non-critical)

---

## 🔧 Common Quick-Fix Issues

### MongoDB Not Running
```bash
# Check if MongoDB is running
# Windows
sc query MongoDB

# Mac/Linux
pgrep mongo

# Start if not running
net start MongoDB  # Windows
brew services start mongodb-community  # Mac
sudo systemctl start mongod  # Linux
```

### Port 5000 Already in Use
Change port in `.env`:
```env
PORT=5001
```

### Pinata Upload Fails
- Check PINATA_JWT is correct
- Test at: https://app.pinata.cloud/developers/api-keys
- Ensure you have free storage space

---

## 📚 Next Steps

### For Full Functionality:

1. **Deploy Smart Contract (15 minutes)**
   - Go to https://remix.ethereum.org
   - Copy code from `backend/contracts/DPPSystem.sol`
   - Deploy to Sepolia testnet
   - Update `CONTRACT_ADDRESS` in `.env`

2. **Get RPC URL (5 minutes)**
   - Sign up at https://infura.io or https://alchemy.com
   - Create project
   - Copy Sepolia RPC URL
   - Update `ETHEREUM_RPC_URL` in `.env`

3. **Restart Server**
   ```bash
   npm run dev
   ```

---

## 🧪 Quick Test Suite

Create `quick-test.sh`:

```bash
#!/bin/bash
BASE="http://localhost:5000"

echo "🧪 Quick Backend Test"

# Test 1: Health
echo "1. Health Check..."
curl -s $BASE/health | grep -q "success" && echo "✅ PASS" || echo "❌ FAIL"

# Test 2: Register
echo "2. User Registration..."
RESPONSE=$(curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","role":"owner","name":"Test"}')

echo $RESPONSE | grep -q "token" && echo "✅ PASS" || echo "❌ FAIL"

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test 3: Create Project
echo "3. Project Creation..."
curl -s -X POST $BASE/api/projects/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Test","projectType":"Commercial","location":{"city":"Mumbai"}}' \
  | grep -q "projectId" && echo "✅ PASS" || echo "❌ FAIL"

echo "✅ Basic functionality working!"
```

Run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

## 🚀 Production Deployment (Quick)

### Using Heroku (5 minutes)

```bash
# Install Heroku CLI
# Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-dpp-backend

# Add MongoDB
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set PINATA_JWT=your-jwt
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy DPP backend"
git push heroku main

# Open
heroku open
```

---

## 📱 Test with Frontend

Once running, your frontend can connect:

```javascript
// Frontend config
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Register user
const response = await fetch(`${API_BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: account,
    role: 'contractor',
    name: 'John Doe'
  })
});
```

---

## 💡 Pro Tips

1. **Use nodemon for development**
   - Already configured with `npm run dev`
   - Auto-restarts on file changes

2. **Check logs for errors**
   - Logs appear in terminal
   - Look for red error messages

3. **Test incrementally**
   - Test each feature before moving to next
   - Use TESTING.md for detailed tests

4. **MongoDB GUI**
   - Install MongoDB Compass for visual database management
   - Connect to: `mongodb://localhost:27017`

5. **API Testing**
   - Use Postman, Thunder Client, or Insomnia
   - Import endpoints from API_REFERENCE.md

---

## 🎯 What You Have Now

✅ Working backend server
✅ MongoDB connection
✅ IPFS integration (Pinata)
✅ User authentication
✅ Project management
✅ DPP lifecycle
✅ File uploads
✅ Dashboards
✅ 31 API endpoints
✅ Complete documentation

---

## 🔗 Important URLs

- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **API Base:** http://localhost:5000/api
- **MongoDB:** mongodb://localhost:27017
- **Pinata Dashboard:** https://app.pinata.cloud

---

## 📞 Need Help?

1. **Check server logs** in terminal
2. **Review .env file** - ensure all values are set
3. **Verify MongoDB** is running
4. **Check PINATA_JWT** is valid
5. **Read SETUP.md** for detailed instructions
6. **Review TESTING.md** for testing help

---

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] .env file created
- [ ] MongoDB running
- [ ] Pinata JWT added
- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] Can register a user
- [ ] Can create a project
- [ ] Ready to integrate with frontend!

---

**🎉 Congratulations! Your DPP backend is running!**

**Time to connect your frontend and start building! 🚀**

---

*Need more details? Check README.md, SETUP.md, API_REFERENCE.md, and TESTING.md*
