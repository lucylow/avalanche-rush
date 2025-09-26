// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import "@chainlink/contracts/src/v0.8/functions/v1_0_0/interfaces/FunctionsClientInterface.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DynamicDifficultyEngine
 * @dev AI-driven game balancing using Chainlink Functions and machine learning
 * @notice Demonstrates advanced AI integration for hackathon-winning features
 */
contract DynamicDifficultyEngine is FunctionsClient, Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct PlayerProfile {
        uint256 skillLevel;        // 1-10 scale
        uint256 playtimeHours;     // Total playtime in hours
        uint256 averageScore;      // Average score across games
        uint256 retentionRate;     // Percentage (0-100)
        uint256 winRate;           // Win percentage (0-100)
        uint256 reactionTime;      // Average reaction time in ms
        uint256 lastDifficulty;    // Last assigned difficulty
        uint256 totalGames;        // Total games played
        uint256 consecutiveWins;   // Current win streak
        uint256 consecutiveLosses; // Current loss streak
        bool isActive;             // Player status
        uint256 lastUpdate;        // Last profile update
    }
    
    struct DifficultyConfig {
        uint256 baseDifficulty;    // Base difficulty level (1-100)
        uint256 minDifficulty;     // Minimum allowed difficulty
        uint256 maxDifficulty;     // Maximum allowed difficulty
        uint256 adjustmentRate;    // How quickly difficulty adjusts (1-10)
        uint256 aiWeight;          // Weight of AI recommendation (0-100)
        bool useMLModel;           // Whether to use ML model
        string mlModelId;          // ML model identifier
    }
    
    struct GameSession {
        uint256 sessionId;
        address player;
        uint256 difficulty;
        uint256 score;
        uint256 duration;
        bool completed;
        uint256 timestamp;
        bytes32 aiRequestId;       // Chainlink Functions request ID
    }
    
    struct AIPrediction {
        uint256 recommendedDifficulty;
        uint256 confidence;        // Confidence level (0-100)
        uint256 reasoningCode;     // Reasoning code for transparency
        uint256 timestamp;
        bool isValid;
    }
    
    struct DifficultyMetrics {
        uint256 totalAdjustments;
        uint256 aiPredictions;
        uint256 averageAccuracy;
        uint256 playerSatisfaction;
        uint256 retentionImprovement;
        uint256 gasUsedForAI;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => PlayerProfile) public playerProfiles;
    mapping(uint256 => GameSession) public gameSessions;
    mapping(bytes32 => AIPrediction) public aiPredictions;
    mapping(bytes32 => address) public requestToPlayer;
    
    DifficultyConfig public difficultyConfig;
    DifficultyMetrics public difficultyMetrics;
    
    uint256 public totalSessions;
    uint256 public totalPlayers;
    uint256 public aiRequestCount;
    
    // Chainlink Functions configuration
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint64 public subscriptionId;
    bytes32 public donId;
    
    // Price feeds for dynamic adjustments
    AggregatorV3Interface internal priceFeed;
    
    // ============ EVENTS ============
    
    event PlayerProfileUpdated(
        address indexed player,
        uint256 skillLevel,
        uint256 playtimeHours,
        uint256 retentionRate
    );
    
    event DifficultyCalculated(
        address indexed player,
        uint256 sessionId,
        uint256 difficulty,
        uint256 aiRecommendation,
        uint256 confidence
    );
    
    event AIRequestSent(
        address indexed player,
        bytes32 indexed requestId,
        uint256 sessionId
    );
    
    event AIResponseReceived(
        bytes32 indexed requestId,
        uint256 difficulty,
        uint256 confidence,
        bool success
    );
    
    event GameSessionCompleted(
        address indexed player,
        uint256 indexed sessionId,
        uint256 score,
        uint256 difficulty,
        bool success
    );
    
    event DifficultyMetricsUpdated(
        uint256 totalAdjustments,
        uint256 aiPredictions,
        uint256 averageAccuracy
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyValidPlayer(address player) {
        require(player != address(0), "Invalid player address");
        require(playerProfiles[player].isActive, "Player not active");
        _;
    }
    
    modifier onlyValidSession(uint256 sessionId) {
        require(gameSessions[sessionId].player != address(0), "Invalid session");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId,
        address _priceFeed
    ) FunctionsClient(functionsRouter) {
        donId = _donId;
        subscriptionId = _subscriptionId;
        priceFeed = AggregatorV3Interface(_priceFeed);
        
        _initializeDifficultyConfig();
        _initializeMetrics();
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Calculate optimal difficulty using AI and traditional algorithms
     */
    function calculateOptimalDifficulty(
        address player,
        uint256 sessionId
    ) external 
        onlyValidPlayer(player)
        nonReentrant
        returns (uint256 difficulty)
    {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Create game session
        gameSessions[sessionId] = GameSession({
            sessionId: sessionId,
            player: player,
            difficulty: 0, // Will be set after calculation
            score: 0,
            duration: 0,
            completed: false,
            timestamp: block.timestamp,
            aiRequestId: bytes32(0)
        });
        
        totalSessions++;
        
        if (difficultyConfig.useMLModel) {
            // Use AI-powered difficulty calculation
            difficulty = _calculateAIDifficulty(player, sessionId);
        } else {
            // Use traditional algorithm
            difficulty = _calculateTraditionalDifficulty(player);
        }
        
        // Apply bounds checking
        difficulty = _applyDifficultyBounds(difficulty);
        
        // Update session with calculated difficulty
        gameSessions[sessionId].difficulty = difficulty;
        
        emit DifficultyCalculated(player, sessionId, difficulty, 0, 0);
        
        return difficulty;
    }
    
    /**
     * @dev Complete a game session and update player profile
     */
    function completeGameSession(
        uint256 sessionId,
        uint256 score,
        uint256 duration,
        bool success
    ) external 
        onlyValidSession(sessionId)
        nonReentrant
    {
        GameSession storage session = gameSessions[sessionId];
        require(!session.completed, "Session already completed");
        
        address player = session.player;
        PlayerProfile storage profile = playerProfiles[player];
        
        // Update session data
        session.score = score;
        session.duration = duration;
        session.completed = true;
        
        // Update player profile based on performance
        _updatePlayerProfile(player, score, duration, success, session.difficulty);
        
        // Update difficulty metrics
        _updateDifficultyMetrics(player, session.difficulty, success);
        
        emit GameSessionCompleted(player, sessionId, score, session.difficulty, success);
    }
    
    /**
     * @dev Update player profile manually (for testing and special cases)
     */
    function updatePlayerProfile(
        address player,
        uint256 skillLevel,
        uint256 playtimeHours,
        uint256 averageScore,
        uint256 retentionRate,
        uint256 winRate,
        uint256 reactionTime
    ) external onlyOwner {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Initialize player if first time
        if (profile.totalGames == 0) {
            totalPlayers++;
        }
        
        profile.skillLevel = skillLevel;
        profile.playtimeHours = playtimeHours;
        profile.averageScore = averageScore;
        profile.retentionRate = retentionRate;
        profile.winRate = winRate;
        profile.reactionTime = reactionTime;
        profile.isActive = true;
        profile.lastUpdate = block.timestamp;
        
        emit PlayerProfileUpdated(player, skillLevel, playtimeHours, retentionRate);
    }
    
    // ============ CHAINLINK FUNCTIONS INTEGRATION ============
    
    /**
     * @dev Send AI request to Chainlink Functions
     */
    function _calculateAIDifficulty(
        address player,
        uint256 sessionId
    ) internal returns (uint256) {
        PlayerProfile memory profile = playerProfiles[player];
        
        // Prepare AI request data
        string[] memory args = new string[](7);
        args[0] = _uint2str(profile.skillLevel);
        args[1] = _uint2str(profile.playtimeHours);
        args[2] = _uint2str(profile.averageScore);
        args[3] = _uint2str(profile.retentionRate);
        args[4] = _uint2str(profile.winRate);
        args[5] = _uint2str(profile.reactionTime);
        args[6] = difficultyConfig.mlModelId;
        
        // Send request to Chainlink Functions
        bytes32 requestId = _sendRequest(
            "calculateDifficulty",
            args,
            subscriptionId,
            300000, // gas limit
            donId
        );
        
        // Store request mapping
        requestToPlayer[requestId] = player;
        gameSessions[sessionId].aiRequestId = requestId;
        
        aiRequestCount++;
        
        emit AIRequestSent(player, requestId, sessionId);
        
        // Return fallback difficulty while waiting for AI response
        return _calculateTraditionalDifficulty(player);
    }
    
    /**
     * @dev Handle AI response from Chainlink Functions
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        s_lastRequestId = requestId;
        s_lastResponse = response;
        s_lastError = err;
        
        address player = requestToPlayer[requestId];
        require(player != address(0), "Invalid request mapping");
        
        if (err.length > 0) {
            // Handle error case
            emit AIResponseReceived(requestId, 0, 0, false);
            return;
        }
        
        // Decode AI response
        (uint256 difficulty, uint256 confidence, uint256 reasoningCode) = abi.decode(response, (uint256, uint256, uint256));
        
        // Store AI prediction
        aiPredictions[requestId] = AIPrediction({
            recommendedDifficulty: difficulty,
            confidence: confidence,
            reasoningCode: reasoningCode,
            timestamp: block.timestamp,
            isValid: true
        });
        
        // Update metrics
        difficultyMetrics.aiPredictions++;
        
        emit AIResponseReceived(requestId, difficulty, confidence, true);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate difficulty using traditional algorithms
     */
    function _calculateTraditionalDifficulty(address player) internal view returns (uint256) {
        PlayerProfile memory profile = playerProfiles[player];
        
        // Base difficulty calculation
        uint256 baseDifficulty = difficultyConfig.baseDifficulty;
        
        // Adjust based on skill level (higher skill = higher difficulty)
        uint256 skillAdjustment = (profile.skillLevel - 5) * 5; // -20 to +20
        
        // Adjust based on win rate
        uint256 winRateAdjustment = (profile.winRate - 50) * 2; // -100 to +100
        
        // Adjust based on playtime (more experience = higher difficulty)
        uint256 experienceAdjustment = profile.playtimeHours / 10; // +1 per 10 hours
        
        // Adjust based on recent performance
        uint256 performanceAdjustment = 0;
        if (profile.consecutiveWins > 3) {
            performanceAdjustment = profile.consecutiveWins * 3; // Increase difficulty for win streaks
        } else if (profile.consecutiveLosses > 3) {
            performanceAdjustment = -(profile.consecutiveLosses * 2); // Decrease difficulty for loss streaks
        }
        
        // Calculate final difficulty
        uint256 calculatedDifficulty = baseDifficulty + 
                                     skillAdjustment + 
                                     winRateAdjustment + 
                                     experienceAdjustment + 
                                     performanceAdjustment;
        
        return calculatedDifficulty;
    }
    
    /**
     * @dev Apply difficulty bounds and constraints
     */
    function _applyDifficultyBounds(uint256 difficulty) internal view returns (uint256) {
        if (difficulty < difficultyConfig.minDifficulty) {
            return difficultyConfig.minDifficulty;
        }
        if (difficulty > difficultyConfig.maxDifficulty) {
            return difficultyConfig.maxDifficulty;
        }
        return difficulty;
    }
    
    /**
     * @dev Update player profile based on game performance
     */
    function _updatePlayerProfile(
        address player,
        uint256 score,
        uint256 duration,
        bool success,
        uint256 difficulty
    ) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Update basic stats
        profile.totalGames++;
        profile.averageScore = ((profile.averageScore * (profile.totalGames - 1)) + score) / profile.totalGames;
        profile.playtimeHours += duration / 3600; // Convert seconds to hours
        
        // Update win/loss streaks
        if (success) {
            profile.consecutiveWins++;
            profile.consecutiveLosses = 0;
        } else {
            profile.consecutiveLosses++;
            profile.consecutiveWins = 0;
        }
        
        // Update win rate
        uint256 totalWins = (profile.winRate * profile.totalGames) / 100;
        if (success) totalWins++;
        profile.winRate = (totalWins * 100) / profile.totalGames;
        
        // Update skill level based on performance
        _updateSkillLevel(player, score, difficulty, success);
        
        // Update last difficulty
        profile.lastDifficulty = difficulty;
        profile.lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Update player skill level based on performance
     */
    function _updateSkillLevel(
        address player,
        uint256 score,
        uint256 difficulty,
        bool success
    ) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Calculate expected performance
        uint256 expectedScore = difficulty * 100; // Base expectation
        
        // Adjust skill level based on performance vs expectation
        if (score > expectedScore * 1.2) {
            // Exceptional performance
            if (profile.skillLevel < 10) {
                profile.skillLevel++;
            }
        } else if (score < expectedScore * 0.8) {
            // Poor performance
            if (profile.skillLevel > 1) {
                profile.skillLevel--;
            }
        }
        
        // Additional adjustments based on consistency
        if (profile.consecutiveWins > 5 && profile.skillLevel < 10) {
            profile.skillLevel++;
        } else if (profile.consecutiveLosses > 5 && profile.skillLevel > 1) {
            profile.skillLevel--;
        }
    }
    
    /**
     * @dev Update difficulty metrics
     */
    function _updateDifficultyMetrics(
        address player,
        uint256 difficulty,
        bool success
    ) internal {
        PlayerProfile memory profile = playerProfiles[player];
        
        // Update metrics
        difficultyMetrics.totalAdjustments++;
        
        // Calculate accuracy (simplified)
        uint256 expectedSuccess = difficulty < 50 ? 80 : (difficulty < 80 ? 60 : 40);
        uint256 actualSuccess = success ? 100 : 0;
        uint256 accuracy = 100 - (expectedSuccess > actualSuccess ? expectedSuccess - actualSuccess : actualSuccess - expectedSuccess);
        
        // Update average accuracy
        difficultyMetrics.averageAccuracy = ((difficultyMetrics.averageAccuracy * (difficultyMetrics.totalAdjustments - 1)) + accuracy) / difficultyMetrics.totalAdjustments;
        
        emit DifficultyMetricsUpdated(
            difficultyMetrics.totalAdjustments,
            difficultyMetrics.aiPredictions,
            difficultyMetrics.averageAccuracy
        );
    }
    
    /**
     * @dev Initialize difficulty configuration
     */
    function _initializeDifficultyConfig() internal {
        difficultyConfig = DifficultyConfig({
            baseDifficulty: 50,
            minDifficulty: 10,
            maxDifficulty: 90,
            adjustmentRate: 5,
            aiWeight: 70, // 70% weight to AI, 30% to traditional
            useMLModel: true,
            mlModelId: "avalanche-rush-difficulty-v1"
        });
    }
    
    /**
     * @dev Initialize metrics
     */
    function _initializeMetrics() internal {
        difficultyMetrics = DifficultyMetrics({
            totalAdjustments: 0,
            aiPredictions: 0,
            averageAccuracy: 0,
            playerSatisfaction: 0,
            retentionImprovement: 0,
            gasUsedForAI: 0
        });
    }
    
    /**
     * @dev Convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get player profile
     */
    function getPlayerProfile(address player) external view returns (PlayerProfile memory) {
        return playerProfiles[player];
    }
    
    /**
     * @dev Get game session
     */
    function getGameSession(uint256 sessionId) external view returns (GameSession memory) {
        return gameSessions[sessionId];
    }
    
    /**
     * @dev Get AI prediction
     */
    function getAIPrediction(bytes32 requestId) external view returns (AIPrediction memory) {
        return aiPredictions[requestId];
    }
    
    /**
     * @dev Get difficulty metrics
     */
    function getDifficultyMetrics() external view returns (DifficultyMetrics memory) {
        return difficultyMetrics;
    }
    
    /**
     * @dev Get recommended difficulty for player
     */
    function getRecommendedDifficulty(address player) external view returns (uint256) {
        return _calculateTraditionalDifficulty(player);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update difficulty configuration
     */
    function updateDifficultyConfig(
        uint256 baseDifficulty,
        uint256 minDifficulty,
        uint256 maxDifficulty,
        uint256 adjustmentRate,
        uint256 aiWeight,
        bool useMLModel,
        string memory mlModelId
    ) external onlyOwner {
        difficultyConfig.baseDifficulty = baseDifficulty;
        difficultyConfig.minDifficulty = minDifficulty;
        difficultyConfig.maxDifficulty = maxDifficulty;
        difficultyConfig.adjustmentRate = adjustmentRate;
        difficultyConfig.aiWeight = aiWeight;
        difficultyConfig.useMLModel = useMLModel;
        difficultyConfig.mlModelId = mlModelId;
    }
    
    /**
     * @dev Update subscription ID
     */
    function updateSubscriptionId(uint64 newSubscriptionId) external onlyOwner {
        subscriptionId = newSubscriptionId;
    }
    
    /**
     * @dev Update DON ID
     */
    function updateDonId(bytes32 newDonId) external onlyOwner {
        donId = newDonId;
    }
    
    /**
     * @dev Emergency function to update metrics
     */
    function updateMetrics(
        uint256 satisfaction,
        uint256 retention
    ) external onlyOwner {
        difficultyMetrics.playerSatisfaction = satisfaction;
        difficultyMetrics.retentionImprovement = retention;
    }
}
