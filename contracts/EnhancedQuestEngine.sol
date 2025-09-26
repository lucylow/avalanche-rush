// contracts/EnhancedQuestEngine.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title EnhancedQuestEngine
 * @dev Advanced quest system with character relationships, social integration, and dynamic rewards
 */
contract EnhancedQuestEngine is VRFConsumerBaseV2, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _questIdCounter;
    Counters.Counter private _achievementIdCounter;
    
    // Chainlink VRF Configuration
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 s_keyHash = 0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    
    // Enhanced Quest System
    struct Quest {
        uint256 questId;
        string title;
        string description;
        string characterId;
        QuestType questType;
        QuestDifficulty difficulty;
        uint256 chapter;
        uint256 levelRequirement;
        uint256 relationshipRequirement;
        QuestStatus status;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        uint256 currentParticipants;
        bool isRepeatable;
        uint256 cooldownDays;
        
        // Objectives
        Objective[] objectives;
        
        // Rewards
        Reward[] rewards;
        
        // Prerequisites
        Prerequisite[] prerequisites;
        
        // Social Integration
        bool requiresSocialSharing;
        uint256 socialMultiplier;
        
        // Relationship Changes
        mapping(string => int256) relationshipChanges;
        
        // Metadata
        string metadataUri;
        address creator;
    }
    
    struct Objective {
        string objectiveId;
        string title;
        string description;
        ObjectiveType objType;
        uint256 target;
        uint256 current;
        bool isOptional;
        bool isCompleted;
        mapping(string => uint256) trackingData;
    }
    
    struct Reward {
        RewardType rewardType;
        uint256 amount;
        string item;
        string rarity;
        bool isNFT;
        string metadataUri;
        uint256 probability; // For random rewards
    }
    
    struct Prerequisite {
        PrerequisiteType prereqType;
        string value;
        uint256 amount;
        string description;
    }
    
    struct PlayerProfile {
        uint256 level;
        uint256 experience;
        uint256 totalScore;
        uint256 highestScore;
        uint256 streakDays;
        uint256 lastLoginTimestamp;
        uint256 totalQuestsCompleted;
        uint256 totalRewardsEarned;
        mapping(string => uint256) relationships;
        mapping(uint256 => bool) questCompletions;
        mapping(uint256 => QuestProgress) activeQuests;
        bool isActive;
    }
    
    struct QuestProgress {
        uint256 questId;
        address player;
        uint256 startTime;
        uint256 lastUpdate;
        mapping(string => uint256) objectiveProgress;
        bool isCompleted;
        uint256 completionTime;
        uint256 socialShares;
        uint256 bonusMultiplier;
    }
    
    struct Achievement {
        uint256 achievementId;
        string title;
        string description;
        AchievementType achievementType;
        uint256 requirement;
        uint256 current;
        bool isCompleted;
        uint256 completionTime;
        Reward[] rewards;
        mapping(address => bool) completedBy;
    }
    
    // Enums
    enum QuestType { MAIN, SIDE, PERSONAL, RELATIONSHIP, EVOLUTION, DAILY, WEEKLY, SEASONAL }
    enum QuestDifficulty { EASY, MEDIUM, HARD, LEGENDARY }
    enum QuestStatus { DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED }
    enum ObjectiveType { COLLECT, COMPLETE, ACHIEVE, INTERACT, EXPLORE, SURVIVE, SCORE, SOCIAL_SHARE }
    enum RewardType { RUSH_TOKENS, NFT, CHARACTER_UNLOCK, EXPERIENCE, COSMETIC, FEATURE_UNLOCK }
    enum PrerequisiteType { LEVEL, ACHIEVEMENT, QUEST, CHARACTER, RELATIONSHIP, SOCIAL }
    enum AchievementType { QUEST_MASTER, SOCIAL_INFLUENCER, CHARACTER_BOND, LEVEL_MILESTONE, STREAK_MASTER }
    
    // State Variables
    mapping(address => PlayerProfile) public playerProfiles;
    mapping(uint256 => Quest) public quests;
    mapping(uint256 => Achievement) public achievements;
    mapping(string => uint256) public characterRelationships;
    mapping(bytes32 => uint256) public vrfRequests;
    
    // Social Integration
    mapping(address => string) public lensProfiles;
    mapping(address => string) public farcasterProfiles;
    mapping(address => uint256) public socialScores;
    
    // Events
    event QuestCreated(uint256 indexed questId, address creator, string title, QuestType questType);
    event QuestStarted(uint256 indexed questId, address player);
    event ObjectiveCompleted(uint256 indexed questId, address player, string objectiveId);
    event QuestCompleted(uint256 indexed questId, address player, uint256 totalRewards, uint256 socialBonus);
    event AchievementUnlocked(uint256 indexed achievementId, address player, string title);
    event RelationshipChanged(address player, string characterId, int256 change, uint256 newLevel);
    event SocialScoreUpdated(address player, uint256 newScore, string platform);
    
    constructor(
        address vrfCoordinator,
        uint64 subscriptionId
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        _initializeDefaultQuests();
        _initializeAchievements();
    }
    
    /**
     * @dev Initialize default quests for the game
     */
    function _initializeDefaultQuests() internal {
        // Avalon's Mountain Guardian Trials
        _createQuest(
            "Trials of the Mountain Guardian",
            "Prove your worth to the ancient guardian of the Avalanche peaks",
            "avalon-the-mountain-guardian",
            QuestType.MAIN,
            QuestDifficulty.HARD,
            1,
            15,
            30,
            86400, // 1 day duration
            100,
            false,
            0,
            true, // requires social sharing
            15, // 15% social multiplier
            "ipfs://avalon-trials-metadata.json"
        );
        
        // Lyra's Innovation Lab
        _createQuest(
            "The Rush Innovation Lab",
            "Help Lyra create revolutionary token-weaving techniques",
            "lyra-rush-weaver",
            QuestType.MAIN,
            QuestDifficulty.MEDIUM,
            1,
            8,
            15,
            43200, // 12 hours duration
            50,
            false,
            0,
            true,
            10,
            "ipfs://lyra-innovation-metadata.json"
        );
    }
    
    /**
     * @dev Initialize default achievements
     */
    function _initializeAchievements() internal {
        _achievementIdCounter.increment();
        uint256 achievementId = _achievementIdCounter.current();
        
        Achievement storage achievement = achievements[achievementId];
        achievement.achievementId = achievementId;
        achievement.title = "Quest Master";
        achievement.description = "Complete 10 quests";
        achievement.achievementType = AchievementType.QUEST_MASTER;
        achievement.requirement = 10;
        achievement.current = 0;
        achievement.isCompleted = false;
    }
    
    /**
     * @dev Create a new quest
     */
    function createQuest(
        string memory title,
        string memory description,
        string memory characterId,
        QuestType questType,
        QuestDifficulty difficulty,
        uint256 chapter,
        uint256 levelRequirement,
        uint256 relationshipRequirement,
        uint256 duration,
        uint256 maxParticipants,
        bool isRepeatable,
        uint256 cooldownDays,
        bool requiresSocialSharing,
        uint256 socialMultiplier,
        string memory metadataUri
    ) external onlyOwner returns (uint256) {
        return _createQuest(
            title,
            description,
            characterId,
            questType,
            difficulty,
            chapter,
            levelRequirement,
            relationshipRequirement,
            duration,
            maxParticipants,
            isRepeatable,
            cooldownDays,
            requiresSocialSharing,
            socialMultiplier,
            metadataUri
        );
    }
    
    function _createQuest(
        string memory title,
        string memory description,
        string memory characterId,
        QuestType questType,
        QuestDifficulty difficulty,
        uint256 chapter,
        uint256 levelRequirement,
        uint256 relationshipRequirement,
        uint256 duration,
        uint256 maxParticipants,
        bool isRepeatable,
        uint256 cooldownDays,
        bool requiresSocialSharing,
        uint256 socialMultiplier,
        string memory metadataUri
    ) internal returns (uint256) {
        _questIdCounter.increment();
        uint256 questId = _questIdCounter.current();
        
        Quest storage quest = quests[questId];
        quest.questId = questId;
        quest.title = title;
        quest.description = description;
        quest.characterId = characterId;
        quest.questType = questType;
        quest.difficulty = difficulty;
        quest.chapter = chapter;
        quest.levelRequirement = levelRequirement;
        quest.relationshipRequirement = relationshipRequirement;
        quest.status = QuestStatus.ACTIVE;
        quest.startTime = block.timestamp;
        quest.endTime = block.timestamp + duration;
        quest.maxParticipants = maxParticipants;
        quest.currentParticipants = 0;
        quest.isRepeatable = isRepeatable;
        quest.cooldownDays = cooldownDays;
        quest.requiresSocialSharing = requiresSocialSharing;
        quest.socialMultiplier = socialMultiplier;
        quest.metadataUri = metadataUri;
        quest.creator = msg.sender;
        
        emit QuestCreated(questId, msg.sender, title, questType);
        return questId;
    }
    
    /**
     * @dev Add objective to quest
     */
    function addObjective(
        uint256 questId,
        string memory objectiveId,
        string memory title,
        string memory description,
        ObjectiveType objType,
        uint256 target,
        bool isOptional
    ) external onlyOwner {
        Quest storage quest = quests[questId];
        require(quest.status == QuestStatus.ACTIVE, "Quest not active");
        
        // Add objective (simplified - in real implementation would use dynamic arrays)
        // This is a placeholder for the objective structure
    }
    
    /**
     * @dev Add reward to quest
     */
    function addReward(
        uint256 questId,
        RewardType rewardType,
        uint256 amount,
        string memory item,
        string memory rarity,
        bool isNFT,
        string memory metadataUri,
        uint256 probability
    ) external onlyOwner {
        Quest storage quest = quests[questId];
        require(quest.status == QuestStatus.ACTIVE, "Quest not active");
        
        // Add reward (simplified - in real implementation would use dynamic arrays)
        // This is a placeholder for the reward structure
    }
    
    /**
     * @dev Start a quest
     */
    function startQuest(uint256 questId) external nonReentrancy {
        Quest storage quest = quests[questId];
        require(quest.status == QuestStatus.ACTIVE, "Quest not active");
        require(block.timestamp < quest.endTime, "Quest ended");
        require(quest.currentParticipants < quest.maxParticipants, "Quest full");
        
        PlayerProfile storage profile = playerProfiles[msg.sender];
        require(profile.level >= quest.levelRequirement, "Level too low");
        require(profile.relationships[quest.characterId] >= quest.relationshipRequirement, "Relationship too low");
        
        // Check if already completed and not repeatable
        if (!quest.isRepeatable && profile.questCompletions[questId]) {
            revert("Quest already completed");
        }
        
        // Initialize quest progress
        QuestProgress storage progress = profile.activeQuests[questId];
        progress.questId = questId;
        progress.player = msg.sender;
        progress.startTime = block.timestamp;
        progress.lastUpdate = block.timestamp;
        progress.isCompleted = false;
        progress.socialShares = 0;
        progress.bonusMultiplier = 0;
        
        quest.currentParticipants++;
        profile.isActive = true;
        
        emit QuestStarted(questId, msg.sender);
    }
    
    /**
     * @dev Complete objective
     */
    function completeObjective(
        uint256 questId,
        string memory objectiveId,
        uint256 progress
    ) external {
        PlayerProfile storage profile = playerProfiles[msg.sender];
        QuestProgress storage questProgress = profile.activeQuests[questId];
        
        require(!questProgress.isCompleted, "Quest already completed");
        require(questProgress.player == msg.sender, "Not your quest");
        
        // Update objective progress
        questProgress.objectiveProgress[objectiveId] += progress;
        questProgress.lastUpdate = block.timestamp;
        
        emit ObjectiveCompleted(questId, msg.sender, objectiveId);
        
        // Check if quest is complete (simplified logic)
        _checkQuestCompletion(questId, msg.sender);
    }
    
    /**
     * @dev Check if quest is complete
     */
    function _checkQuestCompletion(uint256 questId, address player) internal {
        Quest storage quest = quests[questId];
        PlayerProfile storage profile = playerProfiles[player];
        QuestProgress storage questProgress = profile.activeQuests[questId];
        
        // Simplified completion check
        bool isComplete = true; // In real implementation, check all objectives
        
        if (isComplete) {
            questProgress.isCompleted = true;
            questProgress.completionTime = block.timestamp;
            profile.questCompletions[questId] = true;
            profile.totalQuestsCompleted++;
            
            // Calculate rewards with social multiplier
            uint256 baseReward = _calculateBaseReward(quest);
            uint256 socialBonus = _calculateSocialBonus(player, quest);
            uint256 totalReward = baseReward + socialBonus;
            
            profile.totalRewardsEarned += totalReward;
            profile.experience += totalReward;
            
            // Update relationships
            _updateRelationships(player, quest);
            
            // Check achievements
            _checkAchievements(player);
            
            emit QuestCompleted(questId, player, totalReward, socialBonus);
        }
    }
    
    /**
     * @dev Calculate base reward for quest
     */
    function _calculateBaseReward(Quest storage quest) internal view returns (uint256) {
        uint256 baseReward = 100; // Base reward
        
        // Difficulty multiplier
        if (quest.difficulty == QuestDifficulty.MEDIUM) baseReward *= 2;
        else if (quest.difficulty == QuestDifficulty.HARD) baseReward *= 3;
        else if (quest.difficulty == QuestDifficulty.LEGENDARY) baseReward *= 5;
        
        return baseReward;
    }
    
    /**
     * @dev Calculate social bonus
     */
    function _calculateSocialBonus(address player, Quest storage quest) internal view returns (uint256) {
        if (!quest.requiresSocialSharing) return 0;
        
        uint256 socialScore = socialScores[player];
        return (socialScore * quest.socialMultiplier) / 100;
    }
    
    /**
     * @dev Update character relationships
     */
    function _updateRelationships(address player, Quest storage quest) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Update relationship with quest character
        string memory characterId = quest.characterId;
        int256 change = quest.relationshipChanges[characterId];
        
        if (change != 0) {
            uint256 currentRelationship = profile.relationships[characterId];
            uint256 newRelationship = change > 0 
                ? currentRelationship + uint256(change)
                : currentRelationship > uint256(-change) 
                    ? currentRelationship - uint256(-change)
                    : 0;
            
            profile.relationships[characterId] = newRelationship;
            
            emit RelationshipChanged(player, characterId, change, newRelationship);
        }
    }
    
    /**
     * @dev Check and unlock achievements
     */
    function _checkAchievements(address player) internal {
        PlayerProfile storage profile = playerProfiles[player];
        
        // Check Quest Master achievement
        Achievement storage questMaster = achievements[1];
        if (!questMaster.completedBy[player] && profile.totalQuestsCompleted >= questMaster.requirement) {
            questMaster.completedBy[player] = true;
            questMaster.current = profile.totalQuestsCompleted;
            
            emit AchievementUnlocked(1, player, questMaster.title);
        }
    }
    
    /**
     * @dev Link social profiles
     */
    function linkLensProfile(string memory lensHandle) external {
        lensProfiles[msg.sender] = lensHandle;
        _updateSocialScore(msg.sender, 50); // Bonus for linking
    }
    
    function linkFarcasterProfile(string memory farcasterUsername) external {
        farcasterProfiles[msg.sender] = farcasterUsername;
        _updateSocialScore(msg.sender, 50); // Bonus for linking
    }
    
    /**
     * @dev Update social score
     */
    function _updateSocialScore(address player, uint256 points) internal {
        socialScores[player] += points;
        emit SocialScoreUpdated(player, socialScores[player], "social");
    }
    
    /**
     * @dev Share quest completion on social platforms
     */
    function shareQuestCompletion(uint256 questId, string memory platform) external {
        PlayerProfile storage profile = playerProfiles[msg.sender];
        QuestProgress storage questProgress = profile.activeQuests[questId];
        
        require(questProgress.isCompleted, "Quest not completed");
        
        questProgress.socialShares++;
        _updateSocialScore(msg.sender, 10); // Bonus for sharing
        
        emit SocialScoreUpdated(msg.sender, socialScores[msg.sender], platform);
    }
    
    /**
     * @dev Get player profile
     */
    function getPlayerProfile(address player) external view returns (
        uint256 level,
        uint256 experience,
        uint256 totalScore,
        uint256 highestScore,
        uint256 streakDays,
        uint256 lastLoginTimestamp,
        uint256 totalQuestsCompleted,
        uint256 totalRewardsEarned,
        bool isActive
    ) {
        PlayerProfile storage profile = playerProfiles[player];
        return (
            profile.level,
            profile.experience,
            profile.totalScore,
            profile.highestScore,
            profile.streakDays,
            profile.lastLoginTimestamp,
            profile.totalQuestsCompleted,
            profile.totalRewardsEarned,
            profile.isActive
        );
    }
    
    /**
     * @dev Get character relationship
     */
    function getCharacterRelationship(address player, string memory characterId) external view returns (uint256) {
        return playerProfiles[player].relationships[characterId];
    }
    
    /**
     * @dev Get quest details
     */
    function getQuest(uint256 questId) external view returns (
        uint256 questId_,
        string memory title,
        string memory description,
        string memory characterId,
        QuestType questType,
        QuestDifficulty difficulty,
        uint256 chapter,
        uint256 levelRequirement,
        uint256 relationshipRequirement,
        QuestStatus status,
        uint256 startTime,
        uint256 endTime,
        uint256 maxParticipants,
        uint256 currentParticipants,
        bool isRepeatable,
        uint256 cooldownDays,
        bool requiresSocialSharing,
        uint256 socialMultiplier,
        string memory metadataUri,
        address creator
    ) {
        Quest storage quest = quests[questId];
        return (
            quest.questId,
            quest.title,
            quest.description,
            quest.characterId,
            quest.questType,
            quest.difficulty,
            quest.chapter,
            quest.levelRequirement,
            quest.relationshipRequirement,
            quest.status,
            quest.startTime,
            quest.endTime,
            quest.maxParticipants,
            quest.currentParticipants,
            quest.isRepeatable,
            quest.cooldownDays,
            quest.requiresSocialSharing,
            quest.socialMultiplier,
            quest.metadataUri,
            quest.creator
        );
    }
    
    /**
     * @dev Get total number of quests
     */
    function getQuestCount() external view returns (uint256) {
        return _questIdCounter.current();
    }
    
    /**
     * @dev Emergency functions
     */
    function pauseQuest(uint256 questId) external onlyOwner {
        quests[questId].status = QuestStatus.PAUSED;
    }
    
    function resumeQuest(uint256 questId) external onlyOwner {
        quests[questId].status = QuestStatus.ACTIVE;
    }
    
    function cancelQuest(uint256 questId) external onlyOwner {
        quests[questId].status = QuestStatus.CANCELLED;
    }
    
    /**
     * @dev Receive function
     */
    receive() external payable {}
}
