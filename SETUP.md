# DPP System Setup Guide

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB

**Windows:**
```powershell
# If MongoDB is not installed, download from https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Or install MongoDB Compass for GUI management
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Create .env File

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
```

### 4. Get Pinata Credentials

1. Go to https://www.pinata.cloud/
2. Sign up for a free account
3. Go to API Keys section
4. Create new API key
5. Copy:
   - API Key
   - API Secret
   - JWT (recommended)
6. Add to .env file

### 5. Get Ethereum RPC Access

**Option A: Infura**
1. Go to https://infura.io/
2. Sign up and create a new project
3. Copy the Sepolia or Goerli endpoint
4. Add to .env as ETHEREUM_RPC_URL

**Option B: Alchemy**
1. Go to https://www.alchemy.com/
2. Create account and new app
3. Copy the HTTPS endpoint
4. Add to .env

### 6. Deploy Smart Contract

1. Open Remix IDE: https://remix.ethereum.org
2. Create new file `DPPSystem.sol`
3. Copy code from `contracts/DPPSystem.sol`
4. Compile with Solidity 0.8.0+
5. Switch to "Deploy & Run" tab
6. Select "Injected Provider - MetaMask"
7. Connect your MetaMask wallet
8. Ensure you have test ETH (get from faucet)
9. Deploy the contract
10. **Copy the deployed contract address**
11. Add to .env as CONTRACT_ADDRESS

**Get Test ETH:**
- Sepolia Faucet: https://sepoliafaucet.com/
- Goerli Faucet: https://goerlifaucet.com/

### 7. Generate JWT Secret

```bash
# Generate a random JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add to .env as JWT_SECRET

### 8. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 9. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {
#   "success": true,
#   "message": "Server is running",
#   "timestamp": "..."
# }
```

## Verification Checklist

- [ ] MongoDB is running
- [ ] .env file is created with all values
- [ ] Pinata API credentials are valid
- [ ] Ethereum RPC URL is accessible
- [ ] Smart contract is deployed
- [ ] CONTRACT_ADDRESS is added to .env
- [ ] Server starts without errors
- [ ] Health check endpoint responds

## Common Issues and Solutions

### Issue: MongoDB Connection Failed

**Solution:**
```bash
# Check if MongoDB is running
# Windows:
sc query MongoDB

# macOS/Linux:
sudo systemctl status mongod

# If not running, start it
```

### Issue: IPFS Upload Failed

**Solution:**
1. Check Pinata credentials in .env
2. Test Pinata API:
```bash
curl -X GET "https://api.pinata.cloud/data/testAuthentication" \
  -H "Authorization: Bearer YOUR_PINATA_JWT"
```

### Issue: Blockchain Transaction Failed

**Solution:**
1. Check you have test ETH in your wallet
2. Verify RPC URL is correct
3. Ensure contract address is correct
4. Check network (Sepolia/Goerli)

### Issue: Port Already in Use

**Solution:**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

## Next Steps

1. **Test Authentication:**
   - Register a user
   - Login and get JWT token

2. **Create a Test Project:**
   - Use owner account
   - Create first project

3. **Create Test DPP:**
   - Use contractor account
   - Create DPP for the project

4. **Test Full Workflow:**
   - Upload files to IPFS
   - Create DPP with procurement data
   - Update with installation data
   - Enrich with technical docs
   - Verify via QR code

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dpp-system
```

### Production
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dpp-system
CORS_ORIGIN=https://your-domain.com
```

## Performance Tuning

For production, consider:

1. **Database Indexes**: Already configured in models
2. **Caching**: Implement Redis for frequent queries
3. **CDN**: Use CDN for static assets
4. **Load Balancing**: Use PM2 or nginx
5. **Monitoring**: Set up logging and monitoring tools

## Security Hardening

1. Use strong JWT secrets
2. Enable HTTPS in production
3. Set up firewall rules
4. Use environment-specific .env files
5. Regular security audits
6. Keep dependencies updated

## Support

If you encounter issues:
1. Check the README.md for detailed documentation
2. Review error logs
3. Verify all environment variables
4. Test each component individually

Happy coding! 🚀
