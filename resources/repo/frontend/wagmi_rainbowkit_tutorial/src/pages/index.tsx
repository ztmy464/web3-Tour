import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useState } from "react";
import { parseEther } from "viem";
// @ztmy get hooks form wagmi, it similar to useEffect
import { useSendTransaction, useWriteContract, useReadContract } from "wagmi";
import { GTA_NFT_ABI } from "../lib/gtaNft";

const Home: NextPage = () => {

  const [value, setValue] = useState<number>(0);
  const [transferRecipient, setTransferRecipient] = useState<string>("");
  const [mintRecipient, setMintRecipient] = useState<string>("");
  const [tokenURI, setTokenURI] = useState<string>("");
  const [tokenID, setTokenID] = useState<number>(0);

  const CONTRACT_ADDRESS = "0x139A9201c545E49Ec10BbEdC9abBCdfeb0c723EA";

  const { data: hashWriteTx, writeContract } = useWriteContract();
  const { data: hashSendTx, sendTransaction } = useSendTransaction();
  // @ztmy The useReadContract depends on the tokenID and is automatically re-executed when the tokenID changes
  // The useReadContract internally monitors args changes based on useEffect
  const { data: tokenURIData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GTA_NFT_ABI,
    functionName: "tokenURI",
    args: [tokenID],
  });

  const handleSubmitTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendTransaction({
      to: transferRecipient as `0x${string}`,
      value: parseEther(value.toString()),
    });
  };
  const handleSubmitMint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: GTA_NFT_ABI,
      functionName: "safeMint",
      args: [mintRecipient as `0x${string}`, tokenURI],
    });
  };

  return (
    <div className="flex flex-col items-center mt-6 space-y-4">
      <ConnectButton />
      <div className="space-y-4 p-4 border rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Send Transaction</h2>
        <form onSubmit={handleSubmitTransfer} className="flex flex-col gap-4">
          <div className="flex items-center">
            <label className="mr-2">Recipient:</label>
            <input
              type="text"
              value={transferRecipient}
              onChange={(e) => setTransferRecipient(e.target.value)}
              className="w-64 p-1 border rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-9">Ether:</label>
            <input
              type="number"
              value={value}
              step="0.01"
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-64 p-1 border rounded"
            />
          </div>
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Send Ether
          </button>
        </form>
      </div>
      <div className="space-y-4 p-4 border rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Mint NFT</h2>
        <form onSubmit={handleSubmitMint} className="flex flex-col gap-4">
          <div className="flex items-center">
            <label className="mr-2">Recipient:</label>
            <input
              type="text"
              value={mintRecipient}
              onChange={(e) => setMintRecipient(e.target.value)}
              className="w-64 p-1 border rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-1">Token URI:</label>
            <input
              type="text"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
              className="w-64 p-1 border rounded"
            />
          </div>
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Mint NFT
          </button>
        </form>
      </div>
      <div className="space-y-4 p-4 border rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Get Token URI</h2>
        <div className="flex items-center">
          <label className="mr-2">Token ID:</label>
          <input
            type="number"
            value={tokenID}
            // @ztmy setTokenID will
            //  Update the tokenID status
            //  trigger the useReadContract hook
            //  Triggers the component(Home) to re-render
            onChange={(e) => setTokenID(parseInt(e.target.value))}
            className="w-64 p-1 border rounded"
          />
        </div>
        <div>
          <p className="text-center">
            Token URI: {tokenURIData?.toString() || ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
