const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  deployer = (await ethers.getSigners())[0];
  const FundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMeDeployment = await hre.deployments.get("FundMe");
  fundMe = FundMeFactory.attach(fundMeDeployment.address).connect(
    deployer
  );

  console.log(`Got contract FundMe at ${fundMe.target}`)
  console.log("Funding contract...")
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.1"),
  })
  await transactionResponse.wait()
  console.log("Funded!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
