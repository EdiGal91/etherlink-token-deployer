import { defineChain } from "viem";

export const etherlinkMainnet = defineChain({
  id: 42793,
  name: "Etherlink Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "XTZ",
    symbol: "XTZ",
  },
  rpcUrls: {
    default: {
      http: ["https://node.mainnet.etherlink.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherlink Explorer",
      url: "https://explorer.etherlink.com",
    },
  },
});

export const etherlinkTestnet = defineChain({
  id: 128123,
  name: "Etherlink Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "XTZ",
    symbol: "XTZ",
  },
  rpcUrls: {
    default: {
      http: ["https://node.ghostnet.etherlink.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherlink Testnet Explorer",
      url: "https://testnet.explorer.etherlink.com",
    },
  },
  testnet: true,
});
