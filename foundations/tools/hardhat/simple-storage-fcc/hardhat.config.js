require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks/block-number")
/** @type import('hardhat/config').HardhatUserConfig */

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const SEPOLIA_RPC_URL =process.env.SEPOLIA_RPC_URL ||""
const PRIVATE_KEY =process.env.PRIVATE_KEY ||""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  solidity: "0.8.28",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    //@ ztmy has the USD price of each one of these transactions
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
}