import {
    http,
    type Address,
    type Hash,
    type TransactionReceipt,
    createPublicClient,
    createWalletClient,
    custom,
    parseEther,
    stringify,
  } from 'viem'
  import { goerli } from 'viem/chains'
  import 'viem/window'
  import { privateKeyToAccount } from 'viem/accounts'
  
  const publicClient = createPublicClient({
    chain: goerli,
    transport: http(),
  })
  const walletClient = createWalletClient({
    chain: goerli,
    transport: custom(window.ethereum!),
  })
  
  function Example() {
  
    const account = privateKeyToAccount('0x...')
  
    const connect = async () => {
      const [address] = await walletClient.requestAddresses()
  
    }
  
    const sendTransaction = async () => {
      const hash = await walletClient.sendTransaction({
        account,
        to: "11" as Address,
        value: parseEther("11" as `${number}`),
      })
    }
  
  }
  