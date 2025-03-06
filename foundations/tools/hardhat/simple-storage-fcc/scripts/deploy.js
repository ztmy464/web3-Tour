// imports
// @ztmy run allows us to run any hard hat task.
const { ethers, run, network } = require("hardhat");

// async main
async function main() {
  console.log("into main");
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();

  //______________________________________________


    // const deploymentReceipt = await simpleStorage.waitForDeployment();

    console.log(`Deployed contract to: ${simpleStorage.target}`);
    console.log("Waiting for block confirmations...");

    const startTime = Date.now(); // start
    // @ztmy test the properties and function of class TransactionResponse
    const transactionResponse_deploy = await simpleStorage.deploymentTransaction();
    console.log(await transactionResponse_deploy.confirmations());
    console.log(await transactionResponse_deploy.hash);
    console.log(await transactionResponse_deploy.wait(3));
    const endTime = Date.now(); // end
    console.log(`Block confirmations completed! Time elapsed: ${(endTime - startTime) / 1000} seconds`);

    // @ ztmy error when on sepolia
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await verify(simpleStorage.target, []);
    console.log("verify");

    //______________________________________________
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is: ${currentValue}`);

  // Update the current value
  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is: ${updatedValue}`);
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    // @ztmy run allows us to run any hard hat task.
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
};

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
