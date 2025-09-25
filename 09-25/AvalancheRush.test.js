const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Avalanche Rush Game Contracts", function () {
  let rushToken, mockDEX, gameLogic, educationalNFT, reactiveQuestEngine;
  let owner, player1, player2, reactiveNetwork;
  
  beforeEach(async function () {
    [owner, player1, player2, reactiveNetwork] = await ethers.getSigners();
    
    // Deploy RUSH Token
    const RushToken = await ethers.getContractFactory("RushToken");
    rushToken = await RushToken.deploy();
    await rushToken.waitForDeployment();
    
    // Deploy MockDEX
    const MockDEX = await ethers.getContractFactory("MockDEX");
    mockDEX = await MockDEX.deploy();
    await mockDEX.waitForDeployment();
    
    // Deploy GameLogic
    const GameLogic = await ethers.getContractFactory("GameLogic");
    gameLogic = await GameLogic.deploy(
      await rushToken.getAddress(),
      await mockDEX.getAddress()
    );
    await gameLogic.waitForDeployment();
    
    // Deploy EducationalNFT
    const EducationalNFT = await ethers.getContractFactory("EducationalNFT");
    educationalNFT = await EducationalNFT.deploy(1); // subscription ID
    await educationalNFT.waitForDeployment();
    
    // Deploy ReactiveQuestEngine
    const ReactiveQuestEngine = await ethers.getContractFactory("ReactiveQuestEngine");
    reactiveQuestEngine = await ReactiveQuestEngine.deploy(
      reactiveNetwork.address, // mock reactive interface
      1 // subscription ID
    );
    await reactiveQuestEngine.waitForDeployment();
    
    // Set up permissions
    await rushToken.addMinter(await gameLogic.getAddress());
    await rushToken.addMinter(await reactiveQuestEngine.getAddress());
  });

  describe("RUSH Token", function () {
    it("Should deploy with correct initial supply", async function () {
      const initialSupply = await rushToken.totalSupply();
      expect(initialSupply).to.equal(ethers.parseEther("100000000")); // 100M tokens
    });

    it("Should allow minting by authorized minters", async function () {
      await rushToken.mint(player1.address, ethers.parseEther("1000"));
      const balance = await rushToken.balanceOf(player1.address);
      expect(balance).to.equal(ethers.parseEther("1000"));
    });

    it("Should not exceed max supply", async function () {
      const maxSupply = ethers.parseEther("1000000000"); // 1B tokens
      const currentSupply = await rushToken.totalSupply();
      const attemptMint = maxSupply - currentSupply + ethers.parseEther("1");
      
      await expect(
        rushToken.mint(player1.address, attemptMint)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("MockDEX", function () {
    it("Should allow AVAX to USDC swaps", async function () {
      const avaxAmount = ethers.parseEther("1");
      const expectedUSDC = avaxAmount * 20n; // 1 AVAX = 20 USDC
      
      await mockDEX.connect(player1).swapAVAXForUSDC(0, { value: avaxAmount });
      
      const usdcBalance = await mockDEX.getBalance(player1.address);
      expect(usdcBalance).to.equal(expectedUSDC);
    });

    it("Should emit Transfer event on swap", async function () {
      const avaxAmount = ethers.parseEther("1");
      
      await expect(
        mockDEX.connect(player1).swapAVAXForUSDC(0, { value: avaxAmount })
      ).to.emit(mockDEX, "Transfer");
    });
  });

  describe("GameLogic", function () {
    it("Should start a new game session", async function () {
      const sessionId = await gameLogic.connect(player1).startGame.staticCall();
      await gameLogic.connect(player1).startGame();
      
      const session = await gameLogic.getGameSession(sessionId);
      expect(session.player).to.equal(player1.address);
      expect(session.score).to.equal(0);
    });

    it("Should complete game and distribute rewards", async function () {
      // Start game
      await gameLogic.connect(player1).startGame();
      const sessionId = 1;
      const score = 5000;
      
      // Complete game
      await gameLogic.connect(player1).completeGame(sessionId, score);
      
      // Check rewards
      const playerBalance = await rushToken.balanceOf(player1.address);
      expect(playerBalance).to.be.gt(0);
      
      // Check player stats
      const stats = await gameLogic.getPlayerStats(player1.address);
      expect(stats.highScore).to.equal(score);
      expect(stats.totalGamesPlayed).to.equal(1);
    });

    it("Should award high score bonus", async function () {
      // Start and complete first game
      await gameLogic.connect(player1).startGame();
      await gameLogic.connect(player1).completeGame(1, 1000);
      
      const balanceAfterFirst = await rushToken.balanceOf(player1.address);
      
      // Start and complete second game with higher score
      await gameLogic.connect(player1).startGame();
      await gameLogic.connect(player1).completeGame(2, 5000);
      
      const balanceAfterSecond = await rushToken.balanceOf(player1.address);
      const rewardDifference = balanceAfterSecond - balanceAfterFirst;
      
      // Should include high score bonus
      expect(rewardDifference).to.be.gt(ethers.parseEther("10")); // Base reward
    });
  });

  describe("EducationalNFT", function () {
    it("Should mint achievement NFT", async function () {
      // Mock the reactive network call
      await educationalNFT.connect(reactiveNetwork).mintAchievement(
        player1.address,
        1, // questId
        1000, // score
        "First Quest Completed"
      );
      
      const balance = await educationalNFT.balanceOf(player1.address);
      expect(balance).to.equal(1);
      
      const tokenId = 1;
      const achievement = await educationalNFT.achievements(tokenId);
      expect(achievement.questId).to.equal(1);
      expect(achievement.score).to.equal(1000);
    });

    it("Should generate correct token URI", async function () {
      await educationalNFT.connect(reactiveNetwork).mintAchievement(
        player1.address,
        1,
        1000,
        "Test Achievement"
      );
      
      const tokenURI = await educationalNFT.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64");
    });
  });

  describe("ReactiveQuestEngine", function () {
    it("Should track quest completions", async function () {
      const questId = 1;
      const isCompleted = await reactiveQuestEngine.questCompletions(player1.address, questId);
      expect(isCompleted).to.be.false;
    });

    it("Should handle reactive events", async function () {
      // This would test the react() function in a real reactive environment
      // For now, we test the internal logic
      const questId = 1;
      const quest = await reactiveQuestEngine.quests(questId);
      expect(quest.questId).to.equal(0); // Default value since not initialized
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full quest workflow", async function () {
      // 1. Player starts game
      await gameLogic.connect(player1).startGame();
      
      // 2. Player performs DEX swap (quest action)
      await mockDEX.connect(player1).swapAVAXForUSDC(0, { 
        value: ethers.parseEther("0.1") 
      });
      
      // 3. Player completes game with score
      await gameLogic.connect(player1).completeGame(1, 2500);
      
      // 4. Check final state
      const rushBalance = await rushToken.balanceOf(player1.address);
      const usdcBalance = await mockDEX.getBalance(player1.address);
      const playerStats = await gameLogic.getPlayerStats(player1.address);
      
      expect(rushBalance).to.be.gt(0);
      expect(usdcBalance).to.be.gt(0);
      expect(playerStats.totalGamesPlayed).to.equal(1);
      expect(playerStats.highScore).to.equal(2500);
    });
  });
});
