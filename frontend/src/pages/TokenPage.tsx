import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { erc20Abi, parseUnits, formatUnits, type Abi } from "viem";

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
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "Minted",
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
] as const;

const burnableAbi = [
  {
    type: "function",
    name: "burnable",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "amount" }],
    outputs: [],
  },
  {
    type: "event",
    name: "Burned",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
] as const;

const tokenAbi = [
  ...erc20Abi,
  ...ownableAbi,
  ...mintableAbi,
  ...burnableAbi,
] as const satisfies Abi;

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  mintable: boolean;
  burnable: boolean;
}

export function TokenPage() {
  const { address } = useParams<{ address: string }>();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);

  const { address: accountAddress } = useAccount();
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const mintToAddressRef = useRef<HTMLInputElement>(null);
  const mintAmountRef = useRef<HTMLInputElement>(null);
  const burnAmountRef = useRef<HTMLInputElement>(null);

  const isTestnet = chainId === 128123;

  useEffect(() => {
    if (accountAddress && mintToAddressRef.current) {
      mintToAddressRef.current.value = accountAddress;
    }
  }, [accountAddress]);

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

        const [name, symbol, decimals, totalSupply, owner, mintable, burnable] =
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
            publicClient.readContract({
              ...tokenContract,
              functionName: "burnable",
            }),
          ]);

        const supply = formatUnits(totalSupply as bigint, decimals as number);
        const formattedSupply = new Intl.NumberFormat().format(Number(supply));

        setTokenInfo({
          name: name as string,
          symbol: symbol as string,
          decimals: decimals as number,
          totalSupply: formattedSupply,
          owner: owner as string,
          mintable: mintable as boolean,
          burnable: burnable as boolean,
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

  useEffect(() => {
    if (!address || !publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: address as `0x${string}`,
      abi: tokenAbi,
      eventName: "Minted",
      onLogs: async () => {
        const totalSupply = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: "totalSupply",
        });
        const decimals = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: "decimals",
        });

        const supply = formatUnits(totalSupply as bigint, decimals as number);
        const formattedSupply = new Intl.NumberFormat().format(Number(supply));
        setTokenInfo((prev) =>
          prev ? { ...prev, totalSupply: formattedSupply } : null
        );

        if (accountAddress && tokenInfo) {
          const balance = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: tokenAbi,
            functionName: "balanceOf",
            args: [accountAddress],
          });
          const balanceSupply = formatUnits(balance, tokenInfo.decimals);
          const formattedBalance = new Intl.NumberFormat().format(
            Number(balanceSupply)
          );
          setUserBalance(formattedBalance);
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [address, publicClient, tokenAbi, accountAddress, tokenInfo]);

  useEffect(() => {
    if (!address || !publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: address as `0x${string}`,
      abi: tokenAbi,
      eventName: "Burned",
      onLogs: async () => {
        const totalSupply = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: "totalSupply",
        });
        const decimals = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: "decimals",
        });

        const supply = formatUnits(totalSupply as bigint, decimals as number);
        const formattedSupply = new Intl.NumberFormat().format(Number(supply));
        setTokenInfo((prev) =>
          prev ? { ...prev, totalSupply: formattedSupply } : null
        );

        if (accountAddress && tokenInfo) {
          const balance = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: tokenAbi,
            functionName: "balanceOf",
            args: [accountAddress],
          });
          const balanceSupply = formatUnits(balance, tokenInfo.decimals);
          const formattedBalance = new Intl.NumberFormat().format(
            Number(balanceSupply)
          );
          setUserBalance(formattedBalance);
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [address, publicClient, tokenAbi, accountAddress, tokenInfo]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (address && publicClient && accountAddress && tokenInfo) {
        const balance = await publicClient.readContract({
          address: address as `0x${string}`,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [accountAddress],
        });
        const supply = formatUnits(balance, tokenInfo.decimals);
        const formattedBalance = new Intl.NumberFormat().format(Number(supply));
        setUserBalance(formattedBalance);
      } else {
        setUserBalance(null);
      }
    };
    fetchBalance();
  }, [address, publicClient, accountAddress, tokenInfo]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !address ||
      !tokenInfo ||
      !mintToAddressRef.current ||
      !mintAmountRef.current
    )
      return;

    const mintToAddress = mintToAddressRef.current.value;
    const mintAmount = mintAmountRef.current.value;
    const amount = parseUnits(mintAmount, tokenInfo.decimals);

    writeContract({
      address: address as `0x${string}`,
      abi: tokenAbi,
      functionName: "mint",
      args: [mintToAddress as `0x${string}`, amount],
    });
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !tokenInfo || !burnAmountRef.current) return;

    const burnAmount = burnAmountRef.current.value;
    const amount = parseUnits(burnAmount, tokenInfo.decimals);

    writeContract({
      address: address as `0x${string}`,
      abi: tokenAbi,
      functionName: "burn",
      args: [amount],
    });
  };

  const isOwner =
    accountAddress &&
    tokenInfo &&
    accountAddress.toLowerCase() === tokenInfo.owner.toLowerCase();

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
          {tokenInfo.burnable && (
            <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full">
              Burnable
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

            {userBalance && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Balance
                </label>
                <p className="text-lg text-gray-900">
                  {userBalance} {tokenInfo.symbol}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Supply
              </label>
              <p className="text-lg text-gray-900">
                {tokenInfo.totalSupply} {tokenInfo.symbol}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimals
              </label>
              <p className="text-lg text-gray-900">{tokenInfo.decimals}</p>
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

        {isOwner && tokenInfo.mintable && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Mint New Tokens
            </h2>
            <form onSubmit={handleMint} className="space-y-4">
              <div>
                <label
                  htmlFor="mintAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recipient Address
                </label>
                <input
                  type="text"
                  id="mintAddress"
                  ref={mintToAddressRef}
                  defaultValue={accountAddress ?? ""}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="mintAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="mintAmount"
                  ref={mintAmountRef}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={`e.g., 100`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isPending ? "Minting..." : "Mint Tokens"}
              </button>

              {hash && (
                <div className="mt-4 text-sm text-green-600">
                  Transaction sent!{" "}
                  <a
                    href={`${
                      isTestnet
                        ? "https://testnet.explorer.etherlink.com"
                        : "https://explorer.etherlink.com"
                    }/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View on Explorer
                  </a>
                </div>
              )}
              {writeError && (
                <div className="mt-4 text-sm text-red-600">
                  Error: {writeError.message}
                </div>
              )}
            </form>
          </div>
        )}

        {tokenInfo.burnable && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Burn Tokens
            </h2>
            <form onSubmit={handleBurn} className="space-y-4 mb-6">
              <h3 className="font-semibold">Burn from your balance</h3>
              <div>
                <label
                  htmlFor="burnAmount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="burnAmount"
                  ref={burnAmountRef}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={`e.g., 100`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
              >
                {isPending ? "Burning..." : "Burn Tokens"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
