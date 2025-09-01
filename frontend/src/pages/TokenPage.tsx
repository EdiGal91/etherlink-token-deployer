import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useChainId, usePublicClient } from "wagmi";
import { erc20Abi } from "viem";

const ownableAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

const mintableAbi = [
  {
    type: "function",
    name: "mintable",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
] as const;

const tokenAbi = [...erc20Abi, ...ownableAbi, ...mintableAbi] as const;

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  mintable: boolean;
}

export function TokenPage() {
  const { address } = useParams<{ address: string }>();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTestnet = chainId === 128123;

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchTokenInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const tokenContract = {
          address: address as `0x${string}`,
          abi: tokenAbi,
        };

        const [name, symbol, decimals, totalSupply, owner, mintable] =
          await Promise.all([
            publicClient.readContract({
              ...tokenContract,
              functionName: "name",
            }),
            publicClient.readContract({
              ...tokenContract,
              functionName: "symbol",
            }),
            publicClient.readContract({
              ...tokenContract,
              functionName: "decimals",
            }),
            publicClient.readContract({
              ...tokenContract,
              functionName: "totalSupply",
            }),
            publicClient.readContract({
              ...tokenContract,
              functionName: "owner",
            }),
            publicClient.readContract({
              ...tokenContract,
              functionName: "mintable",
            }),
          ]);

        const totalSupplyBigInt = totalSupply as bigint;
        const formattedSupply = (
          Number(totalSupplyBigInt) / Math.pow(10, decimals as number)
        ).toLocaleString();

        setTokenInfo({
          name: name as string,
          symbol: symbol as string,
          decimals: decimals as number,
          totalSupply: formattedSupply,
          owner: owner as string,
          mintable: mintable as boolean,
        });
      } catch (err) {
        console.error("Error fetching token info:", err);
        setError("Failed to load token information");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [address, publicClient]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <p className="text-gray-600">Loading token information...</p>
        </div>
      </div>
    );
  }

  if (error || !tokenInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600">{error || "Token not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{tokenInfo.name}</h1>
          {tokenInfo.mintable && (
            <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
              Mintable
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {tokenInfo.symbol}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimals
              </label>
              <p className="text-lg text-gray-900">{tokenInfo.decimals}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Supply
              </label>
              <p className="text-lg text-gray-900">
                {tokenInfo.totalSupply} {tokenInfo.symbol}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Address
              </label>
              <p className="text-sm font-mono text-gray-600 bg-gray-100 p-3 rounded break-all">
                {address}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <p className="text-sm font-mono text-gray-600 bg-gray-100 p-3 rounded break-all">
                {tokenInfo.owner}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Explorer
              </label>
              <a
                href={`${
                  isTestnet
                    ? "https://testnet.explorer.etherlink.com"
                    : "https://explorer.etherlink.com"
                }/token/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                View on {isTestnet ? "Testnet" : "Mainnet"} Explorer →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
