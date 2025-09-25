```solidity
// contracts/ReactiveQuestEngine.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IReactive, Reactive} from "@reactive-chain/contracts/Reactive.sol";

contract ReactiveQuestEngine is Reactive {
    // Event signatures for Reactive subscription
    bytes32 constant TRANSFER_EVENT = keccak256("Transfer(address,address,uint256)");
    bytes32 constant SWAP_EVENT =
    keccak256("Swap(address,uint256,uint256,uint256,uint256,address)");

    // Quest completion tracking
    mapping(address => mapping(uint256 => bool)) public questCompletions;
    mapping(uint256 => Quest) public quests;

    uint256 private _activeQuestCount;

    struct Quest {
        uint256 questId;
        QuestType qType;
        address verificationContract;
        uint256 minAmount;
        uint256 rewardAmount;
        bool isActive;
    }

    enum QuestType { TRANSFER, SWAP, NFT_MINT, CONTRACT_INTERACTION }

    // Chainlink VRF for raffles
    struct Raffle {
        uint256 raffleId;
        uint256 prizePool;
        address[] participants;
        bool isActive;
        uint256 randomWord;
    }

    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => uint256) public vrfRequests;

    event QuestCompleted(address indexed player, uint256 questId, uint256 timestamp);

    constructor(IReactive reactive, uint256 subscriptionId) Reactive(reactive, subscriptionId) {
        // Subscribe to Avalanche C-Chain events
        _registerEvent(TRANSFER_EVENT);
        _registerEvent(SWAP_EVENT);
        // Initialize default quests
        _initializeQuests();
    }

    /// @dev Reactive callback - automatically triggered by blockchain events
    function react(
        bytes32 eventId,
        address emitter,
        bytes calldata data
    ) external override reactive {
        // Decode event data based on event signature
        if (eventId == TRANSFER_EVENT) {
            _handleTransferEvent(emitter, data);
        } else if (eventId == SWAP_EVENT) {
            _handleSwapEvent(emitter, data);
        }
    }

    function _handleTransferEvent(address emitter, bytes calldata data) internal {
        (address from, address to, uint256 value) = abi.decode(data, (address, address, uint256));
        // Check if this transfer completes any quests
        for (uint256 i = 0; i < _activeQuestCount; i++) {
            Quest memory quest = quests[i];
            if (quest.qType == QuestType.TRANSFER &&
                quest.verificationContract == emitter &&
                value >= quest.minAmount &&
                to != address(0)) {
                // Automatic quest completion
                _completeQuest(to, quest.questId);
            }
        }
    }

    function _handleSwapEvent(address emitter, bytes calldata data) internal {
        // Placeholder for swap event handling logic
    }

    function _completeQuest(address player, uint256 questId) internal {
        require(!questCompletions[player][questId], "Quest already completed");
        questCompletions[player][questId] = true;

        // Automatic NFT minting via Reactive transaction
        _mintAchievementNFT(player, questId);

        // Automatic token rewards
        _distributeTokenRewards(player, quests[questId].rewardAmount);

        // Enter into weekly raffle
        _enterRaffle(player, questId);

        emit QuestCompleted(player, questId, block.timestamp);
    }

    // Chainlink VRF integration for provably fair raffles
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal {
        uint256 raffleId = vrfRequests[requestId];
        Raffle storage raffle = raffles[raffleId];
        raffle.randomWord = randomWords[0];
        address winner = raffle.participants[randomWords[0] % raffle.participants.length];

        // Automatic prize distribution via Reactive transaction
        _distributeRafflePrize(winner, raffle.prizePool);
    }

    function _initializeQuests() internal {
        // Placeholder for quest initialization logic
    }

    function _mintAchievementNFT(address player, uint256 questId) internal {
        // Placeholder for NFT minting logic
    }

    function _distributeTokenRewards(address player, uint256 amount) internal {
        // Placeholder for token distribution logic
    }

    function _enterRaffle(address player, uint256 questId) internal {
        // Placeholder for raffle entry logic
    }

    function _distributeRafflePrize(address winner, uint256 prizePool) internal {
        // Placeholder for prize distribution logic
    }
}
```
