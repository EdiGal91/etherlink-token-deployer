import { useRef, useState } from "react";

import testnetArtifact from "@contracts/chain-128123/artifacts/ERC20FactoryModule#ERC20Factory.json";
import testnetDeployedAddresses from "@contracts/chain-128123/deployed_addresses.json";

const TESTNET_FACTORY_ABI = testnetArtifact.abi;
const TESTNET_FACTORY_ADDRESS =
  testnetDeployedAddresses["ERC20FactoryModule#ERC20Factory"];

export function TokenForm() {
  const tokenNameRef = useRef<HTMLInputElement>(null);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const decimalRef = useRef<HTMLInputElement>(null);
  const initialSupplyRef = useRef<HTMLInputElement>(null);

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

    console.log({
      tokenName,
      tokenSymbol,
      decimals,
      initialSupply,
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Deploy Token
          </button>
        </div>
      </form>
    </div>
  );
}
