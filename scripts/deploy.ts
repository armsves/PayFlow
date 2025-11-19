import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("🚀 Deploying PayFlow contracts to Scroll Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy PayrollManager
  console.log("\n📝 Deploying PayrollManager...");
  const PayrollManager = await ethers.getContractFactory("PayrollManager");
  const payrollManager = await PayrollManager.deploy();
  await payrollManager.waitForDeployment();
  const payrollManagerAddress = await payrollManager.getAddress();
  console.log("✅ PayrollManager deployed to:", payrollManagerAddress);

  // Deploy CrossChainPaymentExecutor
  console.log("\n📝 Deploying CrossChainPaymentExecutor...");

  const wormholeRelayer = "0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470";
  const lifiDiamond = "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE";

  const CrossChainPaymentExecutor = await ethers.getContractFactory("CrossChainPaymentExecutor");
  const executor = await CrossChainPaymentExecutor.deploy(
    wormholeRelayer,
    lifiDiamond,
    payrollManagerAddress
  );
  await executor.waitForDeployment();
  const executorAddress = await executor.getAddress();
  console.log("✅ CrossChainPaymentExecutor deployed to:", executorAddress);

  // Grant roles
  console.log("\n🔐 Configuring roles...");
  const PAYROLL_EXECUTOR = ethers.keccak256(ethers.toUtf8Bytes("PAYROLL_EXECUTOR"));
  const tx = await payrollManager.grantRole(PAYROLL_EXECUTOR, executorAddress);
  await tx.wait();
  console.log("✅ Roles configured");

  // Save deployment addresses
  const deployments = {
    network: "scroll-sepolia",
    chainId: 534351,
    deployer: deployer.address,
    contracts: {
      payrollManager: payrollManagerAddress,
      crossChainExecutor: executorAddress,
    },
    timestamp: new Date().toISOString(),
  };

  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  fs.writeFileSync(
    "./deployments/scroll-sepolia.json",
    JSON.stringify(deployments, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployments/scroll-sepolia.json");
  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
