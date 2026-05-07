const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // 1. UserProfile
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log("UserProfile deployed to:", await userProfile.getAddress());

  // 2. GymCoin: 100000 GC, sellRate=100, buyRate=200
  const GymCoin = await hre.ethers.getContractFactory("GymCoin");
  const gymCoin = await GymCoin.deploy(100000, 100, 200);
  await gymCoin.waitForDeployment();
  console.log("GymCoin deployed to:", await gymCoin.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});