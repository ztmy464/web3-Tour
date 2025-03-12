const { ethers, getNamedAccounts, network } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth.js");
const { networkConfig } = require("../helper-hardhat-config");

const BORROW_MODE = 2; // Variable borrow mode. Stable was disabled.

/*
- getWeth
- getLendingPool
- approveErc20
- deposit
- getBorrowUserData
- getDaiPrice
- borrowDai
- getBorrowUserData
- repay
- getBorrowUserData
*/
async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const lendingPool = await getLendingPool(signer);
  console.log();
  const wethTokenAddress = networkConfig[network.config.chainId].wethToken;

  await approveErc20(wethTokenAddress, lendingPool.target, AMOUNT, signer);
  console.log("Depositing WETH...");
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Desposited!");
  // Getting your borrowing stats
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );
  const daiPrice = await getDaiPrice();
  // availableBorrowsETH * 0.95 * (1 / daiPrice);
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / Number(daiPrice));
  const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString());
  console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`);
  await borrowDai(
    networkConfig[network.config.chainId].daiToken,
    lendingPool,
    amountDaiToBorrowWei,
    deployer
  );
  await getBorrowUserData(lendingPool, deployer);
  await repay(
    amountDaiToBorrowWei,
    networkConfig[network.config.chainId].daiToken,
    lendingPool,
    signer
  );
  await (lendingPool, signer);
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveErc20(daiAddress, lendingPool.target, amount, account);
  const repayTx = await lendingPool.repay(
    daiAddress,
    amount,
    BORROW_MODE,
    account
  );
  await repayTx.wait(1);
  console.log("Repaid!");
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrow,
    BORROW_MODE,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("You've borrowed!");
}

async function getDaiPrice() {
    // we don't need to connect this to the deployer account. Since reading don't need a signer
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    networkConfig[network.config.chainId].daiEthPriceFeed
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function approveErc20(erc20Address, spenderAddress, amount, signer) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer);
  txResponse = await erc20Token.approve(spenderAddress, amount);
  await txResponse.wait(1);
  console.log("Approved!");
}

async function getLendingPool(account) {
  // https://github.com/aave/protocol-v2/tree/master/contracts/interfaces
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    networkConfig[network.config.chainId].lendingPoolAddressesProvider,
    account
  );
  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();

  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);
  console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
  console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
  console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
  return { availableBorrowsETH, totalDebtETH };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
