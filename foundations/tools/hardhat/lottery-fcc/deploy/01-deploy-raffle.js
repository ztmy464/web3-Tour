const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
// @ztmy You have to give that much or fulfillRandomWords are wrong: 
// custom error 'InsufficientBalance()'
const FUND_AMOUNT = ethers.parseEther("100"); // 1 Ether, or 1e18 (10^18) Wei

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let VRFCoordinatorV2_5MockAddress, subscriptionId, VRFCoordinatorV2_5Mock;

  if (chainId == 31337) {

    // Get deployment Information
    const VRFCoordinatorV2_5MockDeployment = await hre.deployments.get(
      "VRFCoordinatorV2_5Mock"
    );

    // Get contract instance
    VRFCoordinatorV2_5Mock = await ethers.getContractAt(
      "VRFCoordinatorV2_5Mock",
      VRFCoordinatorV2_5MockDeployment.address
    );

    // create VRFV2 Subscription
    VRFCoordinatorV2_5MockAddress = VRFCoordinatorV2_5MockDeployment.address;

    const transactionResponse =
      await VRFCoordinatorV2_5Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();

    // @ztmy transaction After sending a transaction, we can only get a transaction response and cannot get the return value directly.
    // @ztmy We can only find Events from the response to get these information

    // Query events from the VRFCoordinatorV2_5Mock contract
    const events = await VRFCoordinatorV2_5Mock.queryFilter(
      // - Use filters.SubscriptionCreated() to only get SubscriptionCreated events
      VRFCoordinatorV2_5Mock.filters.SubscriptionCreated()
    );

    subscriptionId = events[0].args[0];
    log(subscriptionId);
    // Fund the subscription
    // Our mock makes it so we don't actually have to worry about sending fund
    await VRFCoordinatorV2_5Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    console.log("------------");
    const balance = await ethers.provider.getBalance(VRFCoordinatorV2_5Mock.target);
    console.log("Balance:", ethers.formatEther(balance));
  } else {
    VRFCoordinatorV2_5MockAddress =
      networkConfig[chainId]["vrfCoordinator"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("arguments----------------------------------------------------");
  const arguments = [
    VRFCoordinatorV2_5MockAddress,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["keepersUpdateInterval"],
    networkConfig[chainId]["raffleEntranceFee"],
    networkConfig[chainId]["callbackGasLimit"]
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations
  });


  // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2_5Mock contract.
  if (developmentChains.includes(network.name)) {
    await VRFCoordinatorV2_5Mock.addConsumer(subscriptionId, raffle.address);
  }

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(raffle.address, arguments);
  }

  log("Enter lottery with command:");
  const networkName = network.name == "hardhat" ? "localhost" : network.name;
  log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`);
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "raffle"];
