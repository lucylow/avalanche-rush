const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Avalanche Rush Reactive Smart Contracts...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy ReactiveQuestEngine
  console.log("\n📋 Deploying ReactiveQuestEngine...");
  const ReactiveQuestEngine = await hre.ethers.getContractFactory("ReactiveQuestEngine");
  
  // Mock reactive interface and subscription ID for deployment
  const mockReactiveAddress = "0x0000000000000000000000000000000000000001";
  const subscriptionId = 1;
  
  const reactiveQuestEngine = await ReactiveQuestEngine.deploy(
    mockReactiveAddress,
    subscriptionId
  );
  await reactiveQuestEngine.waitForDeployment();
  
  console.log("✅ ReactiveQuestEngine deployed to:", await reactiveQuestEngine.getAddress());

  // Deploy EducationalNFT
  console.log("\n🎨 Deploying EducationalNFT...");
  const EducationalNFT = await hre.ethers.getContractFactory("EducationalNFT");
  const educationalNFT = await EducationalNFT.deploy(subscriptionId);
  await educationalNFT.waitForDeployment();
  
  console.log("✅ EducationalNFT deployed to:", await educationalNFT.getAddress());

  // Deploy Security contract
  console.log("\n🔒 Deploying Security...");
  const Security = await hre.ethers.getContractFactory("Security");
  const security = await Security.deploy();
  await security.waitForDeployment();
  
  console.log("✅ Security deployed to:", await security.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ReactiveQuestEngine: await reactiveQuestEngine.getAddress(),
      EducationalNFT: await educationalNFT.getAddress(),
      Security: await security.getAddress(),
    },
    transactionHashes: {
      ReactiveQuestEngine: reactiveQuestEngine.deploymentTransaction().hash,
      EducationalNFT: educationalNFT.deploymentTransaction().hash,
      Security: security.deploymentTransaction().hash,
    }
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    `./deployment/reactive-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Deployment info saved to deployment directory");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
