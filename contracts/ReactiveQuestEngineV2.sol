// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@reactive-network/contracts/Reactive.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title ReactiveQuestEngineV2
 * @dev Advanced Multi-Chain Quest Engine with sophisticated Reactive Smart Contract integration
 * @notice Demonstrates advanced RSC usage for hackathon-winning features
 */
contract ReactiveQuestEngineV2 is Reactive, Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct ChainConfig {
        uint256 chainId;
        address[] eventContracts;
        bytes32[] eventSignatures;
        uint256 minConfirmations;
        bool isActive;
        uint256 crossChainMultiplier; // Bonus multiplier for cross-chain activities
    }
    
    struct QuestMetrics {
        uint256 totalCompletions;
        uint256 crossChainCompletions;
        uint256 totalRewards;
        uint256 averageCompletionTime;
        uint256 lastActivity;
        mapping(address => uint256) playerCompletions;
    }
    
    struct PlayerProfile {
        uint256 totalXP;
        uint256 level;
        uint256[] completedQuests;
        mapping(uint256 => uint256) chainActivity; // chainId => activity count
        uint256 lastCrossChainActivity;
        bool hasNftEvolution;
    }
    
    struct Quest {
        uint256 questId;
        string title;
        string description;
        uint256 baseReward;
        uint256[] requiredChains;
        bytes32[] requiredEvents;
        uint256 timeLimit;
        uint256 difficulty;
        bool isActive;
        address creator;
    }
    
    struct NFTEvolutionTrigger {
        uint256 minCrossChainActivity;
        uint256 minTotalXP;
        uint256[] requiredQuestTypes;
        bool isTriggered;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(bytes32 => QuestMetrics) public questMetrics;
    mapping(address => PlayerProfile) public playerProfiles;
    mapping(uint256 => Quest) public quests;
    mapping(address => NFTEvolutionTrigger) public nftEvolutionTriggers;
    
    uint256 public totalQuests;
    uint256 public totalPlayers;
    uint256 public totalCrossChainOperations;
    
    // Advanced metrics for hackathon demonstration
    uint256 public dailyReactiveTransactions;
    uint256 public gasEfficiencyScore;
    uint256 public automationSavings;
    
    // ============ EVENTS ============
    
    event QuestCreated(uint256 indexed questId, address indexed creator, uint256[] requiredChains);
    event QuestCompleted(
        address indexed player, 
        uint256 indexed questId, 
        uint256 reward, 
        uint256[] sourceChains,
        uint256 crossChainMultiplier
    );
    event CrossChainActivity(
        address indexed player,
        uint256 indexed questId,
        uint256[] chainIds,
        uint256 totalReward
    );
    event NFTEvolutionTriggered(
        address indexed player,
        uint256 newLevel,
        uint256 crossChainActivity
    );
    event ChainConfigUpdated(uint256 indexed chainId, bool isActive);
    event ReactiveMetricsUpdated(
        uint256 dailyTransactions,
        uint256 gasEfficiency,
        uint256 automationSavings
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyValidChain(uint256 chainId) {
        require(chainConfigs[chainId].isActive, "Chain not configured or inactive");
        _;
    }
    
    modifier questExists(uint256 questId) {
        require(quests[questId].isActive, "Quest does not exist or is inactive");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        _initializeDefaultChains();
    }
    
    // ============ CORE REACTIVE FUNCTIONS ============
    
    /**
     * @dev Main reactive function - handles cross-chain quest events
     * @notice This is the heart of the advanced RSC implementation
     */
    function react(
        bytes32 eventId,
        address emitter,
        bytes calldata data,
        uint256 sourceChain
    ) external override reactive onlyValidChain(sourceChain) {
        
        // Increment reactive transaction counter for metrics
        dailyReactiveTransactions++;
        
        // Decode event data
        (uint256 questId, address player, uint256 score, uint256 timestamp) = abi.decode(data, (uint256, address, uint256, uint256));
        
        // Verify multi-chain conditions
        bool isValid = _verifyMultiChainConditions(eventId, emitter, data, sourceChain);
        require(isValid, "Multi-chain verification failed");
        
        // Calculate cross-chain multiplier
        uint256 multiplier = _calculateCrossChainMultiplier(player, sourceChain);
        
        // Process quest completion
        _processQuestCompletion(player, questId, score, sourceChain, multiplier);
        
        // Check for NFT evolution triggers
        _checkNFTEvolution(player);
        
        // Update cross-chain metrics
        totalCrossChainOperations++;
        
        // Emit cross-chain activity event
        emit CrossChainActivity(player, questId, _getActiveChainIds(), _calculateTotalReward(player, questId, multiplier));
    }
    
    // ============ QUEST MANAGEMENT ============
    
    /**
     * @dev Create a new cross-chain quest
     */
    function createQuest(
        string memory title,
        string memory description,
        uint256 baseReward,
        uint256[] memory requiredChains,
        bytes32[] memory requiredEvents,
        uint256 timeLimit,
        uint256 difficulty
    ) external onlyOwner {
        uint256 questId = totalQuests++;
        
        quests[questId] = Quest({
            questId: questId,
            title: title,
            description: description,
            baseReward: baseReward,
            requiredChains: requiredChains,
            requiredEvents: requiredEvents,
            timeLimit: timeLimit,
            difficulty: difficulty,
            isActive: true,
            creator: msg.sender
        });
        
        // Initialize quest metrics
        questMetrics[keccak256(abi.encodePacked(questId))] = QuestMetrics({
            totalCompletions: 0,
            crossChainCompletions: 0,
            totalRewards: 0,
            averageCompletionTime: 0,
            lastActivity: block.timestamp
        });
        
        emit QuestCreated(questId, msg.sender, requiredChains);
    }
    
    /**
     * @dev Manually complete a quest (for testing and special cases)
     */
    function completeQuest(
        uint256 questId,
        uint256[] memory sourceChains,
        bytes32[] memory proofs
    ) external questExists(questId) nonReentrant {
        address player = msg.sender;
        Quest memory quest = quests[questId];
        
        // Verify cross-chain proofs
        require(_verifyCrossChainProofs(questId, sourceChains, proofs), "Invalid cross-chain proof");
        
        // Calculate reward with cross-chain multiplier
        uint256 multiplier = _calculateCrossChainMultiplier(player, sourceChains[0]);
        uint256 reward = quest.baseReward * multiplier / 100;
        
        // Update player profile
        _updatePlayerProfile(player, questId, reward, sourceChains);
        
        // Update quest metrics
        _updateQuestMetrics(questId, reward, sourceChains.length);
        
        emit QuestCompleted(player, questId, reward, sourceChains, multiplier);
    }
    
    // ============ CHAIN CONFIGURATION ============
    
    /**
     * @dev Configure a new blockchain for cross-chain operations
     */
    function configureChain(
        uint256 chainId,
        address[] memory eventContracts,
        bytes32[] memory eventSignatures,
        uint256 minConfirmations,
        uint256 crossChainMultiplier
    ) external onlyOwner {
        chainConfigs[chainId] = ChainConfig({
            chainId: chainId,
            eventContracts: eventContracts,
            eventSignatures: eventSignatures,
            minConfirmations: minConfirmations,
            isActive: true,
            crossChainMultiplier: crossChainMultiplier
        });
        
        emit ChainConfigUpdated(chainId, true);
    }
    
    /**
     * @dev Toggle chain activity
     */
    function toggleChain(uint256 chainId, bool isActive) external onlyOwner {
        chainConfigs[chainId].isActive = isActive;
        emit ChainConfigUpdated(chainId, isActive);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Verify multi-chain conditions for quest completion
     */
    function _verifyMultiChainConditions(
        bytes32 eventId,
        address emitter,
        bytes calldata data,
        uint256 sourceChain
    ) internal view returns (bool) {
        ChainConfig memory config = chainConfigs[sourceChain];
        
        // Verify emitter is in allowed contracts
        bool isAllowedContract = false;
        for (uint256 i = 0; i < config.eventContracts.length; i++) {
            if (config.eventContracts[i] == emitter) {
                isAllowedContract = true;
                break;
            }
        }
        require(isAllowedContract, "Emitter not in allowed contracts");
        
        // Verify event signature
        bytes32 eventSignature = keccak256(abi.encodePacked(eventId, emitter, data));
        bool isValidSignature = false;
        for (uint256 i = 0; i < config.eventSignatures.length; i++) {
            if (config.eventSignatures[i] == eventSignature) {
                isValidSignature = true;
                break;
            }
        }
        require(isValidSignature, "Invalid event signature");
        
        return true;
    }
    
    /**
     * @dev Calculate cross-chain multiplier based on player activity
     */
    function _calculateCrossChainMultiplier(address player, uint256 sourceChain) internal view returns (uint256) {
        PlayerProfile storage profile = playerProfiles[player];
        ChainConfig memory config = chainConfigs[sourceChain];
        
        uint256 baseMultiplier = config.crossChainMultiplier;
        uint256 activityBonus = profile.chainActivity[sourceChain] * 10; // 10% bonus per activity
        
        return baseMultiplier + activityBonus;
    }
    
    /**
     * @dev Process quest completion with advanced metrics
     */
    function _processQuestCompletion(
        address player,
        uint256 questId,
        uint256 score,
        uint256 sourceChain,
        uint256 multiplier
    ) internal {
        Quest memory quest = quests[questId];
        uint256 reward = quest.baseReward * multiplier / 100;
        
        // Update player profile
        _updatePlayerProfile(player, questId, reward, _getActiveChainIds());
        
        // Update quest metrics
        _updateQuestMetrics(questId, reward, 1);
        
        emit QuestCompleted(player, questId, reward, _getActiveChainIds(), multiplier);
    }
    
    /**
     * @dev Update player profile with cross-chain activity tracking
     */
    function _updatePlayerProfile(
        address player,
        uint256 questId,
        uint256 reward,
        uint256[] memory sourceChains
    ) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Initialize player if first time
        if (profile.totalXP == 0) {
            totalPlayers++;
        }
        
        // Update XP and level
        profile.totalXP += reward;
        profile.level = _calculateLevel(profile.totalXP);
        profile.completedQuests.push(questId);
        
        // Track cross-chain activity
        for (uint256 i = 0; i < sourceChains.length; i++) {
            profile.chainActivity[sourceChains[i]]++;
        }
        
        profile.lastCrossChainActivity = block.timestamp;
    }
    
    /**
     * @dev Check and trigger NFT evolution based on cross-chain patterns
     */
    function _checkNFTEvolution(address player) internal {
        PlayerProfile storage profile = playerProfiles[player];
        NFTEvolutionTrigger storage trigger = nftEvolutionTriggers[player];
        
        if (trigger.isTriggered) return;
        
        uint256 crossChainActivity = _getTotalCrossChainActivity(player);
        
        if (crossChainActivity >= trigger.minCrossChainActivity && 
            profile.totalXP >= trigger.minTotalXP) {
            
            trigger.isTriggered = true;
            profile.hasNftEvolution = true;
            
            emit NFTEvolutionTriggered(player, profile.level, crossChainActivity);
        }
    }
    
    /**
     * @dev Update quest metrics for analytics
     */
    function _updateQuestMetrics(uint256 questId, uint256 reward, uint256 chainCount) internal {
        bytes32 questKey = keccak256(abi.encodePacked(questId));
        QuestMetrics storage metrics = questMetrics[questKey];
        
        metrics.totalCompletions++;
        if (chainCount > 1) {
            metrics.crossChainCompletions++;
        }
        metrics.totalRewards += reward;
        metrics.lastActivity = block.timestamp;
    }
    
    /**
     * @dev Initialize default chain configurations
     */
    function _initializeDefaultChains() internal {
        // Avalanche Fuji Testnet
        configureChain(
            43113, // Fuji chain ID
            [address(this)], // Default to this contract
            [keccak256("QuestCompleted(address,uint256,uint256,uint256)")],
            1,
            110 // 10% bonus for Avalanche
        );
        
        // Ethereum Sepolia
        configureChain(
            11155111, // Sepolia chain ID
            [address(this)],
            [keccak256("QuestCompleted(address,uint256,uint256,uint256)")],
            2,
            120 // 20% bonus for Ethereum
        );
        
        // Polygon Mumbai
        configureChain(
            80001, // Mumbai chain ID
            [address(this)],
            [keccak256("QuestCompleted(address,uint256,uint256,uint256)")],
            1,
            115 // 15% bonus for Polygon
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get player's cross-chain activity summary
     */
    function getPlayerCrossChainActivity(address player) external view returns (
        uint256 totalXP,
        uint256 level,
        uint256[] memory chainActivity,
        uint256 totalCrossChainOperations,
        bool hasNftEvolution
    ) {
        PlayerProfile storage profile = playerProfiles[player];
        uint256[] memory activity = new uint256[](3);
        activity[0] = profile.chainActivity[43113]; // Avalanche
        activity[1] = profile.chainActivity[11155111]; // Ethereum
        activity[2] = profile.chainActivity[80001]; // Polygon
        
        return (
            profile.totalXP,
            profile.level,
            activity,
            _getTotalCrossChainActivity(player),
            profile.hasNftEvolution
        );
    }
    
    /**
     * @dev Get advanced metrics for hackathon demonstration
     */
    function getHackathonMetrics() external view returns (
        uint256 totalPlayers,
        uint256 totalQuests,
        uint256 totalCrossChainOps,
        uint256 dailyReactiveTxns,
        uint256 gasEfficiency,
        uint256 automationSavingsAmount
    ) {
        return (
            totalPlayers,
            totalQuests,
            totalCrossChainOperations,
            dailyReactiveTransactions,
            gasEfficiencyScore,
            automationSavings
        );
    }
    
    /**
     * @dev Get active chain IDs
     */
    function _getActiveChainIds() internal view returns (uint256[] memory) {
        uint256[] memory activeChains = new uint256[](3);
        uint256 count = 0;
        
        if (chainConfigs[43113].isActive) activeChains[count++] = 43113;
        if (chainConfigs[11155111].isActive) activeChains[count++] = 11155111;
        if (chainConfigs[80001].isActive) activeChains[count++] = 80001;
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeChains[i];
        }
        
        return result;
    }
    
    /**
     * @dev Calculate player level based on XP
     */
    function _calculateLevel(uint256 xp) internal pure returns (uint256) {
        if (xp < 1000) return 1;
        if (xp < 5000) return 2;
        if (xp < 15000) return 3;
        if (xp < 30000) return 4;
        if (xp < 50000) return 5;
        return 6; // Max level for hackathon demo
    }
    
    /**
     * @dev Get total cross-chain activity for a player
     */
    function _getTotalCrossChainActivity(address player) internal view returns (uint256) {
        PlayerProfile storage profile = playerProfiles[player];
        return profile.chainActivity[43113] + 
               profile.chainActivity[11155111] + 
               profile.chainActivity[80001];
    }
    
    /**
     * @dev Calculate total reward for a player
     */
    function _calculateTotalReward(address player, uint256 questId, uint256 multiplier) internal view returns (uint256) {
        Quest memory quest = quests[questId];
        return quest.baseReward * multiplier / 100;
    }
    
    /**
     * @dev Verify cross-chain proofs (simplified for demo)
     */
    function _verifyCrossChainProofs(
        uint256 questId,
        uint256[] memory sourceChains,
        bytes32[] memory proofs
    ) internal pure returns (bool) {
        // Simplified verification for hackathon demo
        // In production, this would verify actual cross-chain proofs
        return sourceChains.length > 0 && proofs.length > 0;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update reactive metrics for hackathon demonstration
     */
    function updateReactiveMetrics(
        uint256 gasEfficiency,
        uint256 savings
    ) external onlyOwner {
        gasEfficiencyScore = gasEfficiency;
        automationSavings = savings;
        
        emit ReactiveMetricsUpdated(dailyReactiveTransactions, gasEfficiency, savings);
    }
    
    /**
     * @dev Set NFT evolution trigger for a player
     */
    function setNFTEvolutionTrigger(
        address player,
        uint256 minCrossChainActivity,
        uint256 minTotalXP,
        uint256[] memory requiredQuestTypes
    ) external onlyOwner {
        nftEvolutionTriggers[player] = NFTEvolutionTrigger({
            minCrossChainActivity: minCrossChainActivity,
            minTotalXP: minTotalXP,
            requiredQuestTypes: requiredQuestTypes,
            isTriggered: false
        });
    }
}
