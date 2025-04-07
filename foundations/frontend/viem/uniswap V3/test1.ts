import { config } from 'dotenv';
import { parseUnits, encodeFunctionData, 
    createTestClient, publicActions,walletActions,
    createWalletClient, createPublicClient,
    http, parseAbi, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts'

import { mainnet,foundry } from 'viem/chains';
import { getCAddress, AddressCategory } from '../config/constants';


config();

// 环境变量
const { RPC_URL, PRIVATE_KEY } = process.env;

if (!RPC_URL || !PRIVATE_KEY) {
  throw new Error('请在 .env 文件中设置 RPC_URL 和 PRIVATE_KEY');
}

// 合约地址
const DAI_ADDRESS = getCAddress('DAI');
const WETH_ADDRESS = getCAddress('WETH');
const SWAP_ROUTER_ADDRESS = getCAddress('UNISWAP_V3_SWAP_ROUTER_02');

// 定义 ABI
const daiAbi = parseAbi(['function approve(address, uint256) external returns (bool)']);
const swapRouterAbi = parseAbi([
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)'
  ]);
  
// 创建公共客户端和钱包客户端
const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(RPC_URL),
  });
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(RPC_URL),
  });
   
   

async function main() {
  // 设定交易参数
  const amountIn = parseUnits('1000', 18); // 1000 DAI
  const amountOutMinimum = parseUnits('0.1', 18); // 最小接受的 WETH 数量
  const poolFee = 3000; // 0.3% 手续费
  const blockNumber = await publicClient.getBlockNumber() // Public Action
  console.log('blockNumber', blockNumber);

  // 批准路由器合约花费 DAI
  const approveData = encodeFunctionData({
    abi: daiAbi,
    functionName: 'approve',
    args: [SWAP_ROUTER_ADDRESS, amountIn],
  });

  

    const txHash1 = await walletClient.sendTransaction({
      account,
      to: DAI_ADDRESS,
      approveData
    });

    console.log('交易哈希:', txHash1);

  const recipient= await walletClient.getAddresses();
  console.log('recipient', recipient);
  console.log('DAI_ADDRESS', DAI_ADDRESS);


    // 设置交换参数
    const params = {
        tokenIn: DAI_ADDRESS,
        tokenOut: WETH_ADDRESS,
        fee: poolFee,
        recipient: recipient[0],
        deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 10), // 10 分钟后交易过期
        amountIn,
        amountOutMinimum,
        sqrtPriceLimitX96: parseUnits('0', 18), // 没有价格限制
      };

    const data  = encodeFunctionData({
      abi: swapRouterAbi,
      functionName: 'exactInputSingle',
      args: [params],
    });

    // 执行交换
    const txHash = await walletClient.sendTransaction({
      account,
      to: SWAP_ROUTER_ADDRESS,
      data
    });

    console.log('交易哈希:', txHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
