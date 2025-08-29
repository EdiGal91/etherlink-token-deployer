import { useRef, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";

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

export function TokenForm() {
  const tokenNameRef = useRef<HTMLInputElement>(null);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const decimalRef = useRef<HTMLInputElement>(null);
  const initialSupplyRef = useRef<HTMLInputElement>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isTestnet = chainId === 128123;
  const factoryAbi = isTestnet ? TESTNET_FACTORY_ABI : MAINNET_FACTORY_ABI;
  const factoryAddress = isTestnet
    ? TESTNET_FACTORY_ADDRESS
    : MAINNET_FACTORY_ADDRESS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tokenName = tokenNameRef.current?.value?.trim() ?? "";
    const decimals = parseInputToInt(decimalRef.current?.value, 18);
    const initialSupply = parseInputToInt(
      initialSupplyRef.current?.value,
      1_000
    );

    if (!tokenName.length) {
      alert("Token name required");
      return;
    }
    if (decimals < 0 || decimals > 18) {
      alert("Decimal must be between 0 and 18");
      return;
    }

    if (initialSupply < 0) {
      alert("Initial supply must be greater than 0");
      return;
    }

    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    writeContract({
      address: factoryAddress,
      abi: factoryAbi,
      functionName: "createToken",
      args: [tokenName, tokenSymbol, decimals, initialSupply],
    });
  };

  const parseInputToInt = (value: string = "", defaultValue = 0): number => {
    const parsed = parseInt(value, 10);
    const decimals = Number.isNaN(parsed) ? defaultValue : parsed;
    return decimals;
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tokenName"
          >
            Token Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="tokenName"
            type="text"
            placeholder="e.g., My Token"
            ref={tokenNameRef}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="tokenSymbol"
          >
            Token Symbol
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="tokenSymbol"
            type="text"
            placeholder="e.g., MTK"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="decimals"
          >
            Decimals
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="decimals"
            type="number"
            min={0}
            max={18}
            step={1}
            defaultValue={18}
            ref={decimalRef}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="initialSupply"
          >
            Initial Supply
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="initialSupply"
            type="number"
            defaultValue={1_000}
            ref={initialSupplyRef}
            min={1}
            step={1}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isPending || isConfirming}
          >
            {isPending
              ? "Confirming..."
              : isConfirming
              ? "Deploying..."
              : "Deploy Token"}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error.message}
          </div>
        )}
        {isSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Token deployed successfully!
          </div>
        )}
      </form>
    </div>
  );
}
