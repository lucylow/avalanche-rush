const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Avalanche Rush - Comprehensive Test Suite", function () {
  // Test fixture for consistent setup
  async function deployGameEcosystemFixture() {
    const [owner, player1, player2, player3, reactiveNetwork] = await ethers.getSigners();
    
    // Deploy RUSH Token
    const RushToken = await ethers.getContractFactory("RushToken");
    const rushToken = await RushToken.deploy();
    await rushToken.waitForDeployment();
    
    // Deploy MockDEX
    const MockDEX = await ethers.getContractFactory("MockDEX");
    const mockDEX = await MockDEX.deploy();
    await mockDEX.waitForDeployment();
    
    // Add initial liquidity to DEX
    await mockDEX.addLiquidity({ value: ethers.parseEther("10") });
    
    // Deploy AvalancheRushCore
    const AvalancheRushCore = await ethers.getContractFactory("AvalancheRushCore");
    const avalancheRushCore = await AvalancheRushCore.deploy(await rushToken.getAddress());
    await avalancheRushCore.waitForDeployment();
    
    // Deploy EducationalNFT
    const EducationalNFT = await ethers.getContractFactory("EducationalNFT");
    const educationalNFT = await EducationalNFT.deploy(1);
    await educationalNFT.waitForDeployment();
    
    // Deploy ReactiveQuestEngineAdvanced (mock setup)
    const ReactiveQuestEngineAdvanced = await ethers.getContractFactory("ReactiveQuestEngineAdvanced");
    const reactiveQuestEngine = await ReactiveQuestEngineAdvanced.deploy(
      reactiveNetwork.address, // Mock reactive interface
      1, // Subscription ID
      "0x2eD832Ba664535e5886b75D64C46EB9a228C2610" // Mock VRF Coordinator
    );
    await reactiveQuestEngine.waitForDeployment();
    
    // Setup permissions
    await rushToken.addMinter(await avalancheRushCore.getAddress());
    await rushToken.addMinter(await reactiveQuestEngine.getAddress());
    
    return {
      rushToken,
      mockDEX,
      avalancheRushCore,
      educationalNFT,
      reactiveQuestEngine,
      owner,
      player1,
      player2,
      player3,
      reactiveNetwork
    };
  }

  describe("🏔️ Avalanche Rush Core Game Mechanics", function () {
    it("Should initialize player profile on first game", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // Start first game
      await avalancheRushCore.connect(player1).startGame(0, 1, 1); // Classic mode, difficulty 1, level 1
      
      // Check player profile
      const profile = await avalancheRushCore.getPlayerProfile(player1.address);
      expect(profile.isActive).to.be.true;
      expect(profile.currentLevel).to.equal(1);
      expect(profile.totalGamesPlayed).to.equal(1);
      expect(profile.streakDays).to.equal(1);
    });

    it("Should handle complete game workflow with rewards", async function () {
      const { avalancheRushCore, rushToken, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // Start game
      const tx1 = await avalancheRushCore.connect(player1).startGame(0, 2, 1); // Difficulty 2
      const receipt1 = await tx1.wait();
      
      // Extract session ID from events
      const gameStartedEvent = receipt1.logs.find(log => {
        try {
          const parsed = avalancheRushCore.interface.parseLog(log);
          return parsed?.name === 'GameStarted';
        } catch {
          return false;
        }
      });
      
      const sessionId = gameStartedEvent ? 
        avalancheRushCore.interface.parseLog(gameStartedEvent).args.sessionId : 1;
      
      // Complete game with high score
      const finalScore = 5000;
      const achievements = ["high_score", "combo_master"];
      const skillPoints = [10, 15, 5, 8]; // speed, accuracy, endurance, strategy
      const skillNames = ["speed", "accuracy", "endurance", "strategy"];
      
      await avalancheRushCore.connect(player1).completeGame(
        sessionId,
        finalScore,
        achievements,
        skillPoints,
        skillNames
      );
      
      // Check rewards
      const rushBalance = await rushToken.balanceOf(player1.address);
      expect(rushBalance).to.be.gt(0);
      
      // Check updated profile
      const profile = await avalancheRushCore.getPlayerProfile(player1.address);
      expect(profile.highestScore).to.equal(finalScore);
      expect(profile.totalScore).to.equal(finalScore);
    });

    it("Should handle level progression and unlocking", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // Play multiple games to gain experience
      for (let i = 0; i < 5; i++) {
        await avalancheRushCore.connect(player1).startGame(0, 1, 1);
        await avalancheRushCore.connect(player1).completeGame(
          i + 1, // sessionId
          2000 + i * 500, // increasing scores
          [],
          [5, 5, 5, 5],
          ["speed", "accuracy", "endurance", "strategy"]
        );
      }
      
      const profile = await avalancheRushCore.getPlayerProfile(player1.address);
      expect(profile.currentLevel).to.be.gt(1);
      expect(profile.experience).to.be.gt(1000);
    });

    it("Should maintain daily login streaks", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // First login
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      await avalancheRushCore.connect(player1).completeGame(1, 1000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"]);
      
      // Advance time by 1 day
      await time.increase(86400); // 24 hours
      
      // Second login
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      await avalancheRushCore.connect(player1).completeGame(2, 1000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"]);
      
      const profile = await avalancheRushCore.getPlayerProfile(player1.address);
      expect(profile.streakDays).to.equal(2);
    });

    it("Should reset streak after missing a day", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // First login
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      await avalancheRushCore.connect(player1).completeGame(1, 1000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"]);
      
      // Advance time by 3 days (miss 2 days)
      await time.increase(259200); // 72 hours
      
      // Login after gap
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      await avalancheRushCore.connect(player1).completeGame(2, 1000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"]);
      
      const profile = await avalancheRushCore.getPlayerProfile(player1.address);
      expect(profile.streakDays).to.equal(1); // Reset to 1
    });
  });

  describe("💰 RUSH Token Economics", function () {
    it("Should have correct initial supply and max supply", async function () {
      const { rushToken } = await loadFixture(deployGameEcosystemFixture);
      
      const totalSupply = await rushToken.totalSupply();
      const expectedInitialSupply = ethers.parseEther("100000000"); // 100M
      
      expect(totalSupply).to.equal(expectedInitialSupply);
    });

    it("Should prevent minting beyond max supply", async function () {
      const { rushToken, owner } = await loadFixture(deployGameEcosystemFixture);
      
      const maxSupply = ethers.parseEther("1000000000"); // 1B
      const currentSupply = await rushToken.totalSupply();
      const attemptMint = maxSupply - currentSupply + ethers.parseEther("1");
      
      await expect(
        rushToken.mint(owner.address, attemptMint)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("Should only allow authorized minters", async function () {
      const { rushToken, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await expect(
        rushToken.connect(player1).mint(player1.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should handle token burning correctly", async function () {
      const { rushToken, owner } = await loadFixture(deployGameEcosystemFixture);
      
      const initialSupply = await rushToken.totalSupply();
      const burnAmount = ethers.parseEther("1000");
      
      await rushToken.burn(burnAmount);
      
      const newSupply = await rushToken.totalSupply();
      expect(newSupply).to.equal(initialSupply - burnAmount);
    });
  });

  describe("🔄 MockDEX Trading Mechanics", function () {
    it("Should handle AVAX to USDC swaps", async function () {
      const { mockDEX, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      const avaxAmount = ethers.parseEther("1");
      const expectedUSDC = avaxAmount * 20n; // 1:20 exchange rate
      
      await mockDEX.connect(player1).swapAVAXForUSDC(0, { value: avaxAmount });
      
      const usdcBalance = await mockDEX.getBalance(player1.address);
      expect(usdcBalance).to.equal(expectedUSDC);
    });

    it("Should handle USDC to AVAX swaps", async function () {
      const { mockDEX, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // First get some USDC
      const avaxAmount = ethers.parseEther("2");
      await mockDEX.connect(player1).swapAVAXForUSDC(0, { value: avaxAmount });
      
      // Then swap back
      const usdcAmount = ethers.parseEther("20"); // 20 USDC
      const initialAVAXBalance = await ethers.provider.getBalance(player1.address);
      
      await mockDEX.connect(player1).swapUSDCForAVAX(usdcAmount, 0);
      
      const finalAVAXBalance = await ethers.provider.getBalance(player1.address);
      expect(finalAVAXBalance).to.be.gt(initialAVAXBalance);
    });

    it("Should emit Swap events", async function () {
      const { mockDEX, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      const avaxAmount = ethers.parseEther("1");
      
      await expect(
        mockDEX.connect(player1).swapAVAXForUSDC(0, { value: avaxAmount })
      ).to.emit(mockDEX, "Swap");
    });

    it("Should maintain liquidity reserves", async function () {
      const { mockDEX } = await loadFixture(deployGameEcosystemFixture);
      
      const [avaxReserve, usdcReserve] = await mockDEX.getReserves();
      expect(avaxReserve).to.be.gt(0);
      expect(usdcReserve).to.be.gt(0);
    });
  });

  describe("🎨 Educational NFT System", function () {
    it("Should mint achievement NFTs with correct metadata", async function () {
      const { educationalNFT, reactiveNetwork, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await educationalNFT.connect(reactiveNetwork).mintAchievement(
        player1.address,
        1, // questId
        2500, // score
        "First Quest Completed"
      );
      
      const balance = await educationalNFT.balanceOf(player1.address);
      expect(balance).to.equal(1);
      
      const tokenId = 1;
      const achievement = await educationalNFT.achievements(tokenId);
      expect(achievement.questId).to.equal(1);
      expect(achievement.score).to.equal(2500);
    });

    it("Should generate dynamic token URIs", async function () {
      const { educationalNFT, reactiveNetwork, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await educationalNFT.connect(reactiveNetwork).mintAchievement(
        player1.address,
        1,
        1500,
        "Test Achievement"
      );
      
      const tokenURI = await educationalNFT.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64");
    });

    it("Should handle rare NFT probability", async function () {
      const { educationalNFT, reactiveNetwork, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      let rareCount = 0;
      const totalMints = 50;
      
      // Mint multiple NFTs to test rarity
      for (let i = 1; i <= totalMints; i++) {
        await educationalNFT.connect(reactiveNetwork).mintAchievement(
          player1.address,
          i,
          1000 + i,
          `Achievement ${i}`
        );
        
        const achievement = await educationalNFT.achievements(i);
        if (achievement.isRare) {
          rareCount++;
        }
      }
      
      // Should have some rare NFTs (approximately 5% = 2-3 out of 50)
      expect(rareCount).to.be.gte(1);
      expect(rareCount).to.be.lte(10); // Upper bound for statistical variance
    });
  });

  describe("⚡ Reactive Quest Engine Advanced", function () {
    it("Should initialize with default quests", async function () {
      const { reactiveQuestEngine } = await loadFixture(deployGameEcosystemFixture);
      
      // Check if quests are initialized
      const quest1 = await reactiveQuestEngine.quests(1);
      expect(quest1.isActive).to.be.true;
      expect(quest1.baseReward).to.be.gt(0);
    });

    it("Should track player profiles", async function () {
      const { reactiveQuestEngine, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      const profile = await reactiveQuestEngine.getPlayerProfile(player1.address);
      expect(profile.level).to.equal(0); // Default level for new player
    });

    it("Should manage weekly raffles", async function () {
      const { reactiveQuestEngine } = await loadFixture(deployGameEcosystemFixture);
      
      const raffle = await reactiveQuestEngine.getCurrentRaffle();
      expect(raffle.isActive).to.be.true;
      expect(raffle.prizePool).to.be.gt(0);
    });

    it("Should calculate difficulty multipliers correctly", async function () {
      const { reactiveQuestEngine } = await loadFixture(deployGameEcosystemFixture);
      
      // Test different difficulty quests
      const beginnerQuest = await reactiveQuestEngine.quests(1); // Should be beginner
      const intermediateQuest = await reactiveQuestEngine.quests(2); // Should be intermediate
      
      expect(beginnerQuest.bonusMultiplier).to.equal(100);
      expect(intermediateQuest.bonusMultiplier).to.equal(150);
    });
  });

  describe("🏆 Leaderboard System", function () {
    it("Should update leaderboard with new high scores", async function () {
      const { avalancheRushCore, player1, player2, player3 } = await loadFixture(deployGameEcosystemFixture);
      
      // Players achieve different scores
      const players = [player1, player2, player3];
      const scores = [5000, 7500, 6000];
      
      for (let i = 0; i < players.length; i++) {
        await avalancheRushCore.connect(players[i]).startGame(0, 1, 1);
        await avalancheRushCore.connect(players[i]).completeGame(
          i + 1,
          scores[i],
          [],
          [1, 1, 1, 1],
          ["speed", "accuracy", "endurance", "strategy"]
        );
      }
      
      // Get leaderboard
      const leaderboard = await avalancheRushCore.getLeaderboard(0, 10); // Classic mode, top 10
      
      // Should be sorted by score (highest first)
      expect(leaderboard.scores[0]).to.equal(7500); // player2
      expect(leaderboard.scores[1]).to.equal(6000); // player3
      expect(leaderboard.scores[2]).to.equal(5000); // player1
    });

    it("Should limit leaderboard size", async function () {
      const { avalancheRushCore, owner } = await loadFixture(deployGameEcosystemFixture);
      
      // Create many players and games (simulate with owner for simplicity)
      for (let i = 0; i < 15; i++) {
        await avalancheRushCore.connect(owner).startGame(0, 1, 1);
        await avalancheRushCore.connect(owner).completeGame(
          i + 1,
          1000 + i * 100,
          [],
          [1, 1, 1, 1],
          ["speed", "accuracy", "endurance", "strategy"]
        );
      }
      
      const leaderboard = await avalancheRushCore.getLeaderboard(0, 100);
      expect(leaderboard.players.length).to.be.lte(100); // Should not exceed max size
    });
  });

  describe("🔗 Integration Tests", function () {
    it("Should complete full learn-to-earn workflow", async function () {
      const { 
        avalancheRushCore, 
        mockDEX, 
        rushToken, 
        educationalNFT, 
        reactiveNetwork,
        player1 
      } = await loadFixture(deployGameEcosystemFixture);
      
      // 1. Player starts game
      await avalancheRushCore.connect(player1).startGame(3, 2, 1); // Quest mode, difficulty 2
      
      // 2. Player performs DEX swap (educational quest)
      await mockDEX.connect(player1).swapAVAXForUSDC(0, { 
        value: ethers.parseEther("0.1") 
      });
      
      // 3. Player completes game with good score
      await avalancheRushCore.connect(player1).completeGame(
        1,
        4500,
        ["dex_master", "learner"],
        [15, 20, 10, 12],
        ["speed", "accuracy", "endurance", "strategy"]
      );
      
      // 4. Simulate reactive NFT minting
      await educationalNFT.connect(reactiveNetwork).mintAchievement(
        player1.address,
        1,
        4500,
        "DEX Master Achievement"
      );
      
      // 5. Verify final state
      const rushBalance = await rushToken.balanceOf(player1.address);
      const usdcBalance = await mockDEX.getBalance(player1.address);
      const nftBalance = await educationalNFT.balanceOf(player1.address);
      const playerProfile = await avalancheRushCore.getPlayerProfile(player1.address);
      
      expect(rushBalance).to.be.gt(0);
      expect(usdcBalance).to.be.gt(0);
      expect(nftBalance).to.equal(1);
      expect(playerProfile.highestScore).to.equal(4500);
      expect(playerProfile.totalGamesPlayed).to.equal(1);
    });

    it("Should handle multiple players concurrently", async function () {
      const { avalancheRushCore, rushToken, player1, player2, player3 } = await loadFixture(deployGameEcosystemFixture);
      
      // Multiple players start games simultaneously
      await Promise.all([
        avalancheRushCore.connect(player1).startGame(0, 1, 1),
        avalancheRushCore.connect(player2).startGame(1, 2, 1), // Different mode/difficulty
        avalancheRushCore.connect(player3).startGame(2, 3, 1)
      ]);
      
      // Complete games with different scores
      await Promise.all([
        avalancheRushCore.connect(player1).completeGame(1, 3000, [], [5, 5, 5, 5], ["speed", "accuracy", "endurance", "strategy"]),
        avalancheRushCore.connect(player2).completeGame(2, 4500, [], [8, 7, 6, 9], ["speed", "accuracy", "endurance", "strategy"]),
        avalancheRushCore.connect(player3).completeGame(3, 6000, [], [10, 12, 8, 11], ["speed", "accuracy", "endurance", "strategy"])
      ]);
      
      // Verify all players received rewards
      const balances = await Promise.all([
        rushToken.balanceOf(player1.address),
        rushToken.balanceOf(player2.address),
        rushToken.balanceOf(player3.address)
      ]);
      
      balances.forEach(balance => {
        expect(balance).to.be.gt(0);
      });
    });

    it("Should maintain system state consistency", async function () {
      const { 
        avalancheRushCore, 
        rushToken, 
        mockDEX,
        player1, 
        player2 
      } = await loadFixture(deployGameEcosystemFixture);
      
      // Record initial states
      const initialRushSupply = await rushToken.totalSupply();
      const [initialAVAXReserve, initialUSDCReserve] = await mockDEX.getReserves();
      
      // Perform multiple operations
      for (let i = 0; i < 3; i++) {
        // Player 1 operations
        await avalancheRushCore.connect(player1).startGame(0, 1, 1);
        await avalancheRushCore.connect(player1).completeGame(
          i * 2 + 1,
          2000 + i * 500,
          [],
          [3, 3, 3, 3],
          ["speed", "accuracy", "endurance", "strategy"]
        );
        
        // Player 2 operations
        await avalancheRushCore.connect(player2).startGame(1, 2, 1);
        await avalancheRushCore.connect(player2).completeGame(
          i * 2 + 2,
          2500 + i * 300,
          [],
          [4, 4, 4, 4],
          ["speed", "accuracy", "endurance", "strategy"]
        );
        
        // DEX operations
        await mockDEX.connect(player1).swapAVAXForUSDC(0, { value: ethers.parseEther("0.1") });
      }
      
      // Verify system consistency
      const finalRushSupply = await rushToken.totalSupply();
      const [finalAVAXReserve, finalUSDCReserve] = await mockDEX.getReserves();
      
      // RUSH supply should have increased due to minting rewards
      expect(finalRushSupply).to.be.gt(initialRushSupply);
      
      // DEX reserves should have changed due to swaps
      expect(finalAVAXReserve).to.be.gt(initialAVAXReserve);
      expect(finalUSDCReserve).to.be.lt(initialUSDCReserve);
    });
  });

  describe("🛡️ Security and Edge Cases", function () {
    it("Should prevent unauthorized quest completion", async function () {
      const { avalancheRushCore, player1, player2 } = await loadFixture(deployGameEcosystemFixture);
      
      // Player1 starts game
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      
      // Player2 tries to complete Player1's game
      await expect(
        avalancheRushCore.connect(player2).completeGame(1, 5000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"])
      ).to.be.revertedWith("Not session owner");
    });

    it("Should prevent double completion of games", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      await avalancheRushCore.connect(player1).completeGame(1, 3000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"]);
      
      // Try to complete again
      await expect(
        avalancheRushCore.connect(player1).completeGame(1, 4000, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"])
      ).to.be.revertedWith("Session already completed");
    });

    it("Should handle zero scores gracefully", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      
      await expect(
        avalancheRushCore.connect(player1).completeGame(1, 0, [], [1, 1, 1, 1], ["speed", "accuracy", "endurance", "strategy"])
      ).to.be.revertedWith("Invalid final score");
    });

    it("Should validate skill points array lengths", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      
      // Mismatched array lengths
      await expect(
        avalancheRushCore.connect(player1).completeGame(
          1, 
          3000, 
          [], 
          [1, 1, 1], // 3 elements
          ["speed", "accuracy", "endurance", "strategy"] // 4 elements
        )
      ).to.be.revertedWith("Skill arrays length mismatch");
    });

    it("Should handle large numbers without overflow", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      await avalancheRushCore.connect(player1).startGame(0, 10, 1); // Max difficulty
      
      // Very high score
      const maxScore = 2n ** 32n - 1n; // Large but valid uint256
      await avalancheRushCore.connect(player1).completeGame(
        1,
        maxScore,
        [],
        [100, 100, 100, 100],
        ["speed", "accuracy", "endurance", "strategy"]
      );
      
      const profile = await avalancheRushCore.getPlayerProfile(player1.address);
      expect(profile.highestScore).to.equal(maxScore);
    });
  });

  describe("📊 Gas Optimization Tests", function () {
    it("Should use reasonable gas for game operations", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // Test gas usage for starting game
      const startTx = await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      const startReceipt = await startTx.wait();
      expect(startReceipt.gasUsed).to.be.lt(200000); // Should be under 200k gas
      
      // Test gas usage for completing game
      const completeTx = await avalancheRushCore.connect(player1).completeGame(
        1,
        3000,
        ["achievement1"],
        [5, 5, 5, 5],
        ["speed", "accuracy", "endurance", "strategy"]
      );
      const completeReceipt = await completeTx.wait();
      expect(completeReceipt.gasUsed).to.be.lt(500000); // Should be under 500k gas
    });

    it("Should batch operations efficiently", async function () {
      const { avalancheRushCore, player1 } = await loadFixture(deployGameEcosystemFixture);
      
      // Single game with multiple achievements and skills
      await avalancheRushCore.connect(player1).startGame(0, 1, 1);
      
      const tx = await avalancheRushCore.connect(player1).completeGame(
        1,
        5000,
        ["ach1", "ach2", "ach3", "ach4", "ach5"], // Multiple achievements
        [10, 15, 12, 8, 20, 5, 18, 9], // Multiple skills
        ["speed", "accuracy", "endurance", "strategy", "focus", "timing", "reflexes", "planning"]
      );
      
      const receipt = await tx.wait();
      // Should handle multiple items efficiently
      expect(receipt.gasUsed).to.be.lt(800000);
    });
  });
});
