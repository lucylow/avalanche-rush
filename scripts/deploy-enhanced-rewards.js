const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🎁 Deploying Enhanced Rewards System with Chainlink VRF...");
  console.log("Deploying contracts with the account:", deployer.address);

  // Chainlink VRF Configuration for Avalanche Fuji Testnet
  const VRF_COORDINATOR = "0x2eD832Ba664535e5886b75D64C46EB9a228C2610"; // Avalanche Fuji VRF Coordinator
  const LINK_TOKEN = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846"; // LINK token on Avalanche Fuji
  const KEY_HASH = "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f62"; // Avalanche Fuji key hash
  const FEE = hre.ethers.utils.parseEther("0.25"); // 0.25 LINK fee for Avalanche Fuji

  // Contract addresses
  const RUSH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Deploy RUSH token first
  const ACHIEVEMENT_NFT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Deploy NFT contract first

  try {
    // Step 1: Deploy RUSH Token (if not already deployed)
    console.log("\n💰 Deploying RUSH Token...");
    const RushToken = await ethers.getContractFactory("RushToken");
    const rushToken = await RushToken.deploy(
      "Avalanche Rush Token",
      "RUSH",
      hre.ethers.utils.parseEther("1000000") // 1M tokens
    );
    await rushToken.waitForDeployment();
    const rushTokenAddress = await rushToken.getAddress();
    console.log("✅ RUSH Token deployed to:", rushTokenAddress);

    // Step 2: Deploy Achievement NFT (if not already deployed)
    console.log("\n🏆 Deploying Achievement NFT...");
    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy(
      "Avalanche Rush Achievements",
      "AVAXACH",
      "https://api.avalanche-rush.com/nft-metadata/"
    );
    await achievementNFT.waitForDeployment();
    const achievementNFTAddress = await achievementNFT.getAddress();
    console.log("✅ Achievement NFT deployed to:", achievementNFTAddress);

    // Step 3: Deploy Automated Reward System with Chainlink VRF
    console.log("\n🎁 Deploying Automated Reward System...");
    const AutomatedRewardSystem = await ethers.getContractFactory("AutomatedRewardSystem");
    const rewardSystem = await AutomatedRewardSystem.deploy(
      VRF_COORDINATOR,
      LINK_TOKEN,
      KEY_HASH,
      FEE,
      rushTokenAddress,
      achievementNFTAddress
    );
    await rewardSystem.waitForDeployment();
    const rewardSystemAddress = await rewardSystem.getAddress();
    console.log("✅ Automated Reward System deployed to:", rewardSystemAddress);

    // Step 4: Deploy Enhanced Quest Engine
    console.log("\n⚡ Deploying Enhanced Quest Engine...");
    const EnhancedQuestEngine = await ethers.getContractFactory("EnhancedQuestEngine");
    const questEngine = await EnhancedQuestEngine.deploy(
      rewardSystemAddress,
      achievementNFTAddress,
      rushTokenAddress
    );
    await questEngine.waitForDeployment();
    const questEngineAddress = await questEngine.getAddress();
    console.log("✅ Enhanced Quest Engine deployed to:", questEngineAddress);

    // Step 5: Configure contracts
    console.log("\n🔧 Configuring contracts...");
    
    // Set quest engine in reward system
    const setQuestEngineTx = await rewardSystem.setQuestEngine(questEngineAddress);
    await setQuestEngineTx.wait();
    console.log("✅ Quest engine configured in reward system");

    // Transfer NFT ownership to quest engine
    const transferNFTTx = await achievementNFT.transferOwnership(questEngineAddress);
    await transferNFTTx.wait();
    console.log("✅ NFT ownership transferred to quest engine");

    // Fund reward system with RUSH tokens
    const fundAmount = hre.ethers.utils.parseEther("100000"); // 100K RUSH tokens
    const fundTx = await rushToken.transfer(rewardSystemAddress, fundAmount);
    await fundTx.wait();
    console.log("✅ Reward system funded with RUSH tokens");

    // Step 6: Fund reward system with LINK tokens for VRF
    console.log("\n🔗 Funding reward system with LINK tokens...");
    try {
      // Try to get LINK token contract
      const linkToken = await ethers.getContractAt("LinkTokenInterface", LINK_TOKEN);
      const linkAmount = hre.ethers.utils.parseEther("10"); // 10 LINK tokens
      
      // Check if deployer has LINK tokens
      const linkBalance = await linkToken.balanceOf(deployer.address);
      if (linkBalance.gte(linkAmount)) {
        const fundLinkTx = await linkToken.transfer(rewardSystemAddress, linkAmount);
        await fundLinkTx.wait();
        console.log("✅ Reward system funded with LINK tokens");
      } else {
        console.log("⚠️  Deployer doesn't have enough LINK tokens. Please fund manually.");
        console.log(`   Required: ${hre.ethers.utils.formatEther(linkAmount)} LINK`);
        console.log(`   Current balance: ${hre.ethers.utils.formatEther(linkBalance)} LINK`);
      }
    } catch (error) {
      console.log("⚠️  Could not fund LINK tokens automatically. Please fund manually.");
    }

    // Step 7: Initialize reward system
    console.log("\n🚀 Initializing reward system...");
    
    // Create sample learning modules
    const module1Tx = await questEngine.createLearningModule(
      "Blockchain Fundamentals",
      "Master the basics of blockchain technology and cryptography.",
      "blockchain",
      1, // difficulty
      45, // duration
      80, // required score
      ["Understand blockchain basics", "Learn about consensus", "Explore cryptography"],
      [], // prerequisites
      50, // reward points
      100 // XP reward
    );
    await module1Tx.wait();
    console.log("✅ Created module: Blockchain Fundamentals");

    const module2Tx = await questEngine.createLearningModule(
      "Advanced Solidity",
      "Deep dive into advanced Solidity patterns and gas optimization.",
      "blockchain",
      4, // difficulty
      120, // duration
      90, // required score
      ["Master advanced patterns", "Optimize gas usage", "Build complex contracts"],
      [1], // prerequisites
      150, // reward points
      300 // XP reward
    );
    await module2Tx.wait();
    console.log("✅ Created module: Advanced Solidity");

    const module3Tx = await questEngine.createLearningModule(
      "Avalanche Subnet Development",
      "Learn to create and deploy custom Avalanche subnets.",
      "avalanche",
      5, // difficulty
      180, // duration
      95, // required score
      ["Create custom subnets", "Deploy validators", "Manage subnet economics"],
      [1, 2], // prerequisites
      200, // reward points
      500 // XP reward
    );
    await module3Tx.wait();
    console.log("✅ Created module: Avalanche Subnet Development");

    // Step 8: Start first weekly raffle
    console.log("\n🎲 Starting first weekly raffle...");
    const startRaffleTx = await rewardSystem.startWeeklyRaffle();
    await startRaffleTx.wait();
    console.log("✅ First weekly raffle started");

    // Step 9: Save deployment information
    const deploymentInfo = {
      network: "avalanche-fuji",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      chainlinkVrf: {
        coordinator: VRF_COORDINATOR,
        linkToken: LINK_TOKEN,
        keyHash: KEY_HASH,
        fee: FEE.toString()
      },
      contracts: {
        RushToken: {
          address: rushTokenAddress,
          name: "Avalanche Rush Token",
          symbol: "RUSH",
          totalSupply: "1000000"
        },
        AchievementNFT: {
          address: achievementNFTAddress,
          name: "Avalanche Rush Achievements",
          symbol: "AVAXACH",
          baseURI: "https://api.avalanche-rush.com/nft-metadata/"
        },
        AutomatedRewardSystem: {
          address: rewardSystemAddress,
          rushToken: rushTokenAddress,
          achievementNFT: achievementNFTAddress,
          vrfCoordinator: VRF_COORDINATOR
        },
        EnhancedQuestEngine: {
          address: questEngineAddress,
          rewardSystem: rewardSystemAddress,
          achievementNFT: achievementNFTAddress,
          rushToken: rushTokenAddress
        }
      },
      features: {
        automatedRewards: true,
        evolvingNFTs: true,
        weeklyRaffles: true,
        chainlinkVRF: true,
        transparentDistribution: true,
        reactiveAutomation: true
      },
      statistics: {
        modulesCreated: 3,
        totalRewardPoints: 400,
        totalXPAvailable: 900,
        raffleStarted: true
      }
    };

    // Save to file
    const deploymentPath = path.join(__dirname, "..", "deployments", "enhanced-rewards-deployment.json");
    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentPath);

    // Step 10: Display comprehensive summary
    console.log("\n🎉 Enhanced Rewards System Deployment Summary:");
    console.log("=".repeat(70));
    console.log(`💰 RUSH Token:           ${rushTokenAddress}`);
    console.log(`🏆 Achievement NFT:      ${achievementNFTAddress}`);
    console.log(`🎁 Reward System:        ${rewardSystemAddress}`);
    console.log(`⚡ Quest Engine:         ${questEngineAddress}`);
    console.log(`🔗 VRF Coordinator:      ${VRF_COORDINATOR}`);
    console.log(`🌐 Network:             Avalanche Fuji Testnet`);
    console.log(`👤 Deployer:            ${deployer.address}`);
    console.log("=".repeat(70));
    
    console.log("\n🚀 Features Deployed:");
    console.log("✅ Automated AVAX & RUSH token distribution");
    console.log("✅ Evolving NFT system with 10 levels");
    console.log("✅ Weekly raffles with Chainlink VRF");
    console.log("✅ Transparent reward tracking");
    console.log("✅ Reactive Network automation");
    console.log("✅ Performance-based multipliers");
    console.log("✅ Streak bonus system");
    console.log("✅ Provably fair randomness");

    console.log("\n🔗 Frontend Configuration:");
    console.log(`Update these addresses in your frontend components:`);
    console.log(`const RUSH_TOKEN_ADDRESS = "${rushTokenAddress}";`);
    console.log(`const ACHIEVEMENT_NFT_ADDRESS = "${achievementNFTAddress}";`);
    console.log(`const REWARD_SYSTEM_ADDRESS = "${rewardSystemAddress}";`);
    console.log(`const QUEST_ENGINE_ADDRESS = "${questEngineAddress}";`);

    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend contract addresses");
    console.log("2. Fund reward system with AVAX for distribution");
    console.log("3. Set up Reactive Network subscription");
    console.log("4. Create NFT metadata server");
    console.log("5. Test reward distribution flow");
    console.log("6. Test raffle system with VRF");
    console.log("7. Deploy to Avalanche mainnet");
    console.log("8. Launch community rewards program");

    console.log("\n⚠️  Important Notes:");
    console.log("- This deployment is on Avalanche Fuji testnet");
    console.log("- Fund the reward system with LINK tokens for VRF");
    console.log("- Test all features before mainnet deployment");
    console.log("- Set up proper metadata URIs for NFTs");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
