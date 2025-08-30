import { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  usePublicClient,
  useWatchContractEvent,
} from "wagmi";

import { erc20Abi } from "viem";

import { watchAsset } from "wagmi/actions";
import { useConfig } from "wagmi";

const testnetArtifactMod = await import(
  "@contracts/chain-128123/artifacts/ERC20FactoryModule_ERC20Factory.json"
);
const testnetDeployedMod = await import(
  "@contracts/chain-128123/deployed_addresses.json"
);

const TESTNET_FACTORY_ABI = (testnetArtifactMod.default as any).abi;
const TESTNET_FACTORY_ADDRESS = (
  testnetDeployedMod.default as Record<string, string>
)["ERC20FactoryModule#ERC20Factory"] as `0x${string}`;

const mainnetArtifactMod = await import(
  "@contracts/chain-42793/artifacts/ERC20FactoryModule_ERC20Factory.json"
);
const mainnetDeployedMod = await import(
  "@contracts/chain-42793/deployed_addresses.json"
);

const MAINNET_FACTORY_ABI = (mainnetArtifactMod.default as any).abi;
const MAINNET_FACTORY_ADDRESS = (
  mainnetDeployedMod.default as Record<string, string>
)["ERC20FactoryModule#ERC20Factory"] as `0x${string}`;

interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export function DeployedTokensList() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const config = useConfig();
  const [tokenDetails, setTokenDetails] = useState<TokenDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const isTestnet = chainId === 128123;
  const factoryAbi = isTestnet ? TESTNET_FACTORY_ABI : MAINNET_FACTORY_ABI;
  const factoryAddress = isTestnet
    ? TESTNET_FACTORY_ADDRESS
    : MAINNET_FACTORY_ADDRESS;

  const { data: userTokenAddresses, refetch: refetchTokens } = useReadContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "getOwnerTokens",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!isConnected,
    },
  });

  const tokensList = userTokenAddresses as string[] | undefined;

  useEffect(() => {
    if (!tokensList || !publicClient || tokensList.length === 0) {
      setTokenDetails([]);
      return;
    }

    const fetchTokenDetails = async () => {
      setLoading(true);
      try {
        const details = await Promise.all(
          tokensList.map(async (tokenAddress) => {
            const [name, symbol, decimals, balance] = await Promise.all([
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "name",
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "symbol",
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "decimals",
              }),
              publicClient.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [address as `0x${string}`],
              }),
            ]);

            const decimalsNum = decimals as number;
            const balanceBigInt = balance as bigint;
            const formattedBalance = (
              Number(balanceBigInt) / Math.pow(10, decimalsNum)
            ).toLocaleString();

            return {
              address: tokenAddress,
              name: name as string,
              symbol: symbol as string,
              decimals: decimalsNum,
              balance: formattedBalance,
            };
          })
        );

        setTokenDetails(details);
      } catch (error) {
        console.error("Error fetching token details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenDetails();
  }, [tokensList, publicClient]);

  useWatchContractEvent({
    address: factoryAddress,
    abi: factoryAbi,
    eventName: "TokenDeployed",
    args: {
      owner: address,
    },
    onLogs: () => {
      refetchTokens();
    },
  });

  const addToMetaMask = async (token: TokenDetails) => {
    try {
      await watchAsset(config, {
        type: "ERC20",
        options: {
          address: token.address as `0x${string}`,
          symbol: token.symbol,
          decimals: token.decimals,
        },
      });
    } catch (error) {
      console.error("Error adding token to MetaMask:", error);
      alert("Failed to add token to MetaMask");
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h3 className="text-lg font-semibold mb-4">Your Deployed Tokens</h3>
        <p className="text-gray-600">Connect your wallet to see your tokens</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
      <h3 className="text-lg font-semibold mb-4">Your Deployed Tokens</h3>

      {loading ? (
        <p className="text-gray-600">Loading token details...</p>
      ) : !tokensList || tokensList.length === 0 ? (
        <p className="text-gray-600">No tokens deployed yet</p>
      ) : (
        <div className="space-y-4">
          {tokenDetails.map((token, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{token.name}</h4>
                  <p className="text-gray-600">{token.symbol}</p>
                  <p className="text-green-600 font-medium">
                    Balance: {token.balance} {token.symbol}
                  </p>
                </div>
                <button
                  onClick={() => addToMetaMask(token)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Add to MetaMask
                </button>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Decimals: {token.decimals}
              </div>

              <div className="text-xs font-mono text-gray-500 bg-white p-2 rounded border">
                <a
                  href={`${
                    isTestnet
                      ? "https://testnet.explorer.etherlink.com"
                      : "https://explorer.etherlink.com"
                  }/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View on {isTestnet ? "Testnet" : "Mainnet"} Explorer →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
