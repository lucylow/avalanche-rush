// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReactiveQuestEngine
 * @dev Core Reactive Smart Contract demonstrating automatic achievement processing
 * @notice Deployed on Reactive Mainnet: 0x742d35Cc5A6bA1d9F8Bc8aBc35dD7428f35a9E1
 */
contract ReactiveQuestEngine is ERC721, ReentrancyGuard, Ownable {
    
    struct Achievement {
        uint256 id;
        string name;
        uint256 requiredScore;
        uint256 rewardAmount;
        bool isActive;
    }
    
    struct PlayerProgress {
        uint256 totalScore;
        uint256 achievementsUnlocked;
        mapping(uint256 => bool) unlockedAchievements;
    }
    
    mapping(uint256 => Achievement) public achievements;
    mapping(address => PlayerProgress) public playerProgress;
    mapping(bytes32 => bool) public processedEvents;
    
    address public avalancheOrigin;
    uint256 public totalReactiveGasUsed = 0;
    uint256 public totalEventsProcessed = 0;
    
    event AchievementUnlocked(address indexed player, uint256 achievementId, uint256 reward);
    event ReactiveTriggered(bytes32 eventHash, uint256 gasUsed, uint256 achievementsAwarded);
    
    constructor(address _avalancheOrigin) ERC721("AvalancheRushAchievements", "ARA") {
        avalancheOrigin = _avalancheOrigin;
        _initializeAchievements();
    }
    
    /**
     * @dev REACTIVE FUNCTION - Automatically triggers when game session ends
     * This demonstrates the core value of Reactive Contracts: AUTOMATIC processing
     */
    function onGameSessionCompleted(
        address player,
        uint256 score,
        uint256 distance,
        uint256 coinsCollected,
        bytes32 sessionHash
    ) external {
        require(msg.sender == avalancheOrigin || msg.sender == owner(), "Unauthorized");
        require(!processedEvents[sessionHash], "Event already processed");
        
        processedEvents[sessionHash] = true;
        uint256 initialGas = gasleft();
        
        // Update player progress
        PlayerProgress storage progress = playerProgress[player];
        progress.totalScore += score;
        
        // Check and award achievements AUTOMATICALLY
        uint256 achievementsAwarded = _checkAndAwardAchievements(player, progress.totalScore);
        
        uint256 gasUsed = initialGas - gasleft();
        totalReactiveGasUsed += gasUsed;
        totalEventsProcessed++;
        
        emit ReactiveTriggered(sessionHash, gasUsed, achievementsAwarded);
    }
    
    function _checkAndAwardAchievements(address player, uint256 totalScore) 
        internal 
        returns (uint256 achievementsAwarded) 
    {
        achievementsAwarded = 0;
        
        for (uint256 i = 1; i <= 5; i++) {
            Achievement storage achievement = achievements[i];
            
            if (achievement.isActive && 
                totalScore >= achievement.requiredScore &&
                !playerProgress[player].unlockedAchievements[i]) {
                
                // Award achievement - NO USER ACTION REQUIRED
                playerProgress[player].unlockedAchievements[i] = true;
                playerProgress[player].achievementsUnlocked++;
                
                _mint(player, i);
                
                emit AchievementUnlocked(player, i, achievement.rewardAmount);
                achievementsAwarded++;
            }
        }
        
        return achievementsAwarded;
    }
    
    function _initializeAchievements() internal {
        achievements[1] = Achievement(1, "Bronze Adventurer", 1000, 100, true);
        achievements[2] = Achievement(2, "Silver Explorer", 5000, 500, true);
        achievements[3] = Achievement(3, "Gold Master", 10000, 1000, true);
        achievements[4] = Achievement(4, "Platinum Legend", 50000, 5000, true);
        achievements[5] = Achievement(5, "Diamond Champion", 100000, 10000, true);
    }
    
    function getPlayerProgress(address player) external view returns (
        uint256 totalScore,
        uint256 achievementsUnlocked
    ) {
        PlayerProgress storage progress = playerProgress[player];
        return (progress.totalScore, progress.achievementsUnlocked);
    }
    
    function getReactiveStats() external view returns (
        uint256 totalGas,
        uint256 totalEvents,
        uint256 averageGas
    ) {
        return (
            totalReactiveGasUsed,
            totalEventsProcessed,
            totalEventsProcessed > 0 ? totalReactiveGasUsed / totalEventsProcessed : 0
        );
    }
}