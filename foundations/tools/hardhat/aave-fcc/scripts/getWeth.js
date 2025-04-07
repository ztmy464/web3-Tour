const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

const AMOUNT = ethers.parseEther("0.02")

async function getWeth() {
    const { deployer } = await hre.getNamedAccounts()
    const signer = await ethers.getSigner(deployer)
const iWeth = await ethers.getContractAt(
    "IWeth",
    // @ztmy get Contract derictly from forked main net 
    networkConfig[network.config.chainId].wethToken,
    signer
)
    const txResponse = await iWeth.deposit({
        value: AMOUNT,
    })
    console.log(deployer)
    await txResponse.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, AMOUNT }
