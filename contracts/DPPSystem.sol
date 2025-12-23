// SAMPLE SMART CONTRACT FOR DPP SYSTEM
// Deploy this in Remix IDE and update the CONTRACT_ADDRESS in .env

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DPPSystem {
    // Structs
    struct Project {
        string projectId;
        address owner;
        string metadataIPFS;
        uint256 createdAt;
        bool isActive;
    }
    
    struct DPP {
        string dppId;
        string projectId;
        address creator;
        string procurementMetadataIPFS;
        string installationMetadataIPFS;
        string enrichmentMetadataIPFS;
        uint256 createdAt;
        bool isActive;
    }
    
    // Mappings
    mapping(string => Project) public projects;
    mapping(string => DPP) public dpps;
    mapping(string => bool) public projectExists;
    mapping(string => bool) public dppExists;
    
    // Events
    event ProjectCreated(
        string indexed projectId,
        address indexed owner,
        string metadataIPFS,
        uint256 timestamp
    );
    
    event DPPCreated(
        string indexed dppId,
        string indexed projectId,
        address indexed creator,
        string metadataIPFS,
        uint256 timestamp
    );
    
    event InstallationUpdated(
        string indexed dppId,
        address indexed installer,
        string installationMetadataIPFS,
        uint256 timestamp
    );
    
    event DPPEnriched(
        string indexed dppId,
        address indexed supplier,
        string enrichmentMetadataIPFS,
        uint256 timestamp
    );
    
    // Create a new project
    function createProject(
        string memory projectId,
        string memory metadataIPFS
    ) public returns (bytes32) {
        require(!projectExists[projectId], "Project already exists");
        
        projects[projectId] = Project({
            projectId: projectId,
            owner: msg.sender,
            metadataIPFS: metadataIPFS,
            createdAt: block.timestamp,
            isActive: true
        });
        
        projectExists[projectId] = true;
        
        emit ProjectCreated(projectId, msg.sender, metadataIPFS, block.timestamp);
        
        return keccak256(abi.encodePacked(projectId, msg.sender, block.timestamp));
    }
    
    // Mint a new DPP
    function mintDPP(
        string memory dppId,
        string memory projectId,
        string memory metadataIPFS
    ) public returns (bytes32) {
        require(projectExists[projectId], "Project does not exist");
        require(!dppExists[dppId], "DPP already exists");
        
        dpps[dppId] = DPP({
            dppId: dppId,
            projectId: projectId,
            creator: msg.sender,
            procurementMetadataIPFS: metadataIPFS,
            installationMetadataIPFS: "",
            enrichmentMetadataIPFS: "",
            createdAt: block.timestamp,
            isActive: true
        });
        
        dppExists[dppId] = true;
        
        emit DPPCreated(dppId, projectId, msg.sender, metadataIPFS, block.timestamp);
        
        return keccak256(abi.encodePacked(dppId, projectId, msg.sender, block.timestamp));
    }
    
    // Update installation data
    function updateInstallation(
        string memory dppId,
        string memory installationMetadataIPFS
    ) public returns (bytes32) {
        require(dppExists[dppId], "DPP does not exist");
        require(dpps[dppId].isActive, "DPP is not active");
        
        dpps[dppId].installationMetadataIPFS = installationMetadataIPFS;
        
        emit InstallationUpdated(dppId, msg.sender, installationMetadataIPFS, block.timestamp);
        
        return keccak256(abi.encodePacked(dppId, msg.sender, block.timestamp));
    }
    
    // Enrich DPP with additional documentation
    function enrichDPP(
        string memory dppId,
        string memory enrichmentMetadataIPFS
    ) public returns (bytes32) {
        require(dppExists[dppId], "DPP does not exist");
        require(dpps[dppId].isActive, "DPP is not active");
        
        dpps[dppId].enrichmentMetadataIPFS = enrichmentMetadataIPFS;
        
        emit DPPEnriched(dppId, msg.sender, enrichmentMetadataIPFS, block.timestamp);
        
        return keccak256(abi.encodePacked(dppId, msg.sender, block.timestamp));
    }
    
    // Get DPP details
    function getDPP(string memory dppId) public view returns (
        string memory,
        string memory,
        address,
        uint256,
        bool
    ) {
        require(dppExists[dppId], "DPP does not exist");
        DPP memory dpp = dpps[dppId];
        return (
            dpp.dppId,
            dpp.projectId,
            dpp.creator,
            dpp.createdAt,
            dpp.isActive
        );
    }
    
    // Verify DPP exists and is active
    function verifyDPP(string memory dppId) public view returns (bool) {
        return dppExists[dppId] && dpps[dppId].isActive;
    }
    
    // Get project details
    function getProject(string memory projectId) public view returns (
        string memory,
        address,
        string memory,
        uint256,
        bool
    ) {
        require(projectExists[projectId], "Project does not exist");
        Project memory project = projects[projectId];
        return (
            project.projectId,
            project.owner,
            project.metadataIPFS,
            project.createdAt,
            project.isActive
        );
    }
}


/*
DEPLOYMENT INSTRUCTIONS:

1. Open Remix IDE (https://remix.ethereum.org)
2. Create a new file named "DPPSystem.sol"
3. Paste the above code
4. Compile with Solidity 0.8.0+
5. Deploy to your chosen network:
   - For testing: Sepolia, Goerli
   - For production: Ethereum Mainnet, Polygon
6. Copy the deployed contract address
7. Update backend/.env with CONTRACT_ADDRESS=0x...

AFTER DEPLOYMENT:
- Copy the ABI from Remix (Compilation Details)
- Update the DPP_CONTRACT_ABI in backend/services/blockchainService.js
- The current ABI in blockchainService.js should work if you use this exact contract
*/
