import { useRef, useState, useEffect } from "react";
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

const SUPPLY_PRESETS = [
  { value: 1_000, label: "1K" },
  { value: 100_000, label: "100K" },
  { value: 1_000_000, label: "1M" },
  { value: 100_000_000, label: "100M" },
  { value: 1_000_000_000, label: "1B" },
];

export function TokenForm() {
  const tokenNameRef = useRef<HTMLInputElement>(null);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const decimalRef = useRef<HTMLInputElement>(null);
  const [initialSupply, setInitialSupply] = useState("1,000");
  const isMintableRef = useRef<HTMLInputElement>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    reset();
  }, [chainId, reset]);

  useEffect(() => {
    if (isSuccess) {
      if (tokenNameRef.current) tokenNameRef.current.value = "";
      setTokenSymbol("");
      if (decimalRef.current) decimalRef.current.value = "18";
      setInitialSupply("1,000");
      if (isMintableRef.current) isMintableRef.current.checked = false;
    }
  }, [isSuccess]);

  const isTestnet = chainId === 128123;
  const factoryAbi = isTestnet ? TESTNET_FACTORY_ABI : MAINNET_FACTORY_ABI;
  const factoryAddress = isTestnet
    ? TESTNET_FACTORY_ADDRESS
    : MAINNET_FACTORY_ADDRESS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tokenName = tokenNameRef.current?.value?.trim() ?? "";
    const decimals = parseInputToInt(decimalRef.current?.value, 18);
    const supply = parseInt(initialSupply.replace(/,/g, ""), 10);
    const isMintable = isMintableRef.current?.checked ?? false;

    if (!tokenName.length) {
      alert("Token name required");
      return;
    }
    if (decimals < 0 || decimals > 18) {
      alert("Decimal must be between 0 and 18");
      return;
    }

    if (supply < 0) {
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
      args: [tokenName, tokenSymbol, decimals, supply, isMintable],
    });
  };

  const parseInputToInt = (value: string = "", defaultValue = 0): number => {
    const parsed = parseInt(value.replace(/,/g, ""), 10);
    const num = Number.isNaN(parsed) ? defaultValue : parsed;
    return num;
  };

  const handleSupplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (!/^\d*$/.test(value)) return; // Allow only numbers
    const num = parseInt(value, 10);
    setInitialSupply(Number.isNaN(num) ? "" : num.toLocaleString());
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
            onChange={(e) =>
              setTokenSymbol(e.target.value.toUpperCase().slice(0, 11))
            }
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
          <div className="relative">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-16"
              id="initialSupply"
              type="text"
              value={initialSupply}
              onChange={handleSupplyChange}
              required
            />
            {tokenSymbol && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500">{tokenSymbol}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2 mt-2">
            {SUPPLY_PRESETS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setInitialSupply(value.toLocaleString())}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold py-1 px-3 rounded-full transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              ref={isMintableRef}
              defaultChecked={false}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Make token mintable</span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
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
