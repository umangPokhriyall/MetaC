const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy UUPS logic contract
  const Pair = await ethers.getContractFactory("MiniDexPairUpgradeable");
  const pairImpl = await upgrades.deployImplementation(Pair, { kind: "uups" });
  console.log("Pair logic (implementation) deployed at:", pairImpl);

  // Deploy factory proxy
  const Factory = await ethers.getContractFactory("MiniDexFactoryUpgradeable");
  const factory = await upgrades.deployProxy(
    Factory,
    [pairImpl, deployer.address],
    { initializer: "initialize" }
  );
  await factory.waitForDeployment();

  console.log("Factory proxy deployed at:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
