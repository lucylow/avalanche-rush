// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RushToken
 * @dev Main utility token for Avalanche Rush game
 * @notice ERC-20 token with controlled minting for game rewards
 */
contract RushToken is ERC20, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant REWARD_POOL = TOTAL_SUPPLY * 40 / 100; // 40% for rewards
    uint256 public constant TEAM_ALLOCATION = TOTAL_SUPPLY * 20 / 100; // 20% for team
    uint256 public constant MARKETING_ALLOCATION = TOTAL_SUPPLY * 15 / 100; // 15% for marketing
    uint256 public constant LIQUIDITY_ALLOCATION = TOTAL_SUPPLY * 10 / 100; // 10% for liquidity
    uint256 public constant TREASURY_ALLOCATION = TOTAL_SUPPLY * 10 / 100; // 10% for treasury
    uint256 public constant COMMUNITY_ALLOCATION = TOTAL_SUPPLY * 5 / 100; // 5% for community
    
    // State variables
    mapping(address => bool) public minters;
    mapping(address => bool) public burners;
    uint256 public rewardPoolRemaining = REWARD_POOL;
    uint256 public teamAllocationRemaining = TEAM_ALLOCATION;
    uint256 public marketingAllocationRemaining = MARKETING_ALLOCATION;
    uint256 public liquidityAllocationRemaining = LIQUIDITY_ALLOCATION;
    uint256 public treasuryAllocationRemaining = TREASURY_ALLOCATION;
    uint256 public communityAllocationRemaining = COMMUNITY_ALLOCATION;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event BurnerAdded(address indexed burner);
    event BurnerRemoved(address indexed burner);
    event RewardsMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("Rush Token", "RUSH") {
        // Mint initial allocations
        _mint(owner(), TEAM_ALLOCATION);
        _mint(owner(), MARKETING_ALLOCATION);
        _mint(owner(), LIQUIDITY_ALLOCATION);
        _mint(owner(), TREASURY_ALLOCATION);
        _mint(owner(), COMMUNITY_ALLOCATION);
        
        // Add owner as initial minter
        minters[owner()] = true;
    }
    
    /**
     * @dev Mint reward tokens to players
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mintRewards(address to, uint256 amount) external onlyMinter nonReentrant {
        require(rewardPoolRemaining >= amount, "RushToken: Reward pool exhausted");
        require(to != address(0), "RushToken: Cannot mint to zero address");
        
        rewardPoolRemaining -= amount;
        _mint(to, amount);
        
        emit RewardsMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens (for deflationary mechanics)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnTokens(address from, uint256 amount) external onlyBurner nonReentrant {
        require(balanceOf(from) >= amount, "RushToken: Insufficient balance");
        
        _burn(from, amount);
        
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Add a new minter address
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "RushToken: Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter address
     * @param minter Address to remove as minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Add a new burner address
     * @param burner Address to add as burner
     */
    function addBurner(address burner) external onlyOwner {
        require(burner != address(0), "RushToken: Invalid burner address");
        burners[burner] = true;
        emit BurnerAdded(burner);
    }
    
    /**
     * @dev Remove a burner address
     * @param burner Address to remove as burner
     */
    function removeBurner(address burner) external onlyOwner {
        burners[burner] = false;
        emit BurnerRemoved(burner);
    }
    
    /**
     * @dev Get remaining reward pool amount
     * @return Remaining tokens in reward pool
     */
    function getRewardPoolRemaining() external view returns (uint256) {
        return rewardPoolRemaining;
    }
    
    /**
     * @dev Get total supply information
     * @return Total supply, circulating supply, and remaining allocations
     */
    function getSupplyInfo() external view returns (
        uint256 totalSupply_,
        uint256 circulatingSupply,
        uint256 rewardPoolRemaining_,
        uint256 teamAllocationRemaining_,
        uint256 marketingAllocationRemaining_,
        uint256 liquidityAllocationRemaining_,
        uint256 treasuryAllocationRemaining_,
        uint256 communityAllocationRemaining_
    ) {
        totalSupply_ = totalSupply();
        circulatingSupply = totalSupply_ - rewardPoolRemaining - teamAllocationRemaining - 
                          marketingAllocationRemaining - liquidityAllocationRemaining - 
                          treasuryAllocationRemaining - communityAllocationRemaining;
        rewardPoolRemaining_ = rewardPoolRemaining;
        teamAllocationRemaining_ = teamAllocationRemaining;
        marketingAllocationRemaining_ = marketingAllocationRemaining;
        liquidityAllocationRemaining_ = liquidityAllocationRemaining;
        treasuryAllocationRemaining_ = treasuryAllocationRemaining;
        communityAllocationRemaining_ = communityAllocationRemaining;
    }
    
    // Modifiers
    modifier onlyMinter() {
        require(minters[msg.sender], "RushToken: Only minters can call this function");
        _;
    }
    
    modifier onlyBurner() {
        require(burners[msg.sender], "RushToken: Only burners can call this function");
        _;
    }
}