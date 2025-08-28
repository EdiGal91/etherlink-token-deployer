import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { etherlinkMainnet, etherlinkTestnet } from "./chains.ts";
import App from "./App.tsx";

import "./index.css";

const config = getDefaultConfig({
  appName: "Etherlink Token Deployer",
  projectId: import.meta.env.VITE_WC_PROJECT_ID,
  chains: [etherlinkMainnet, etherlinkTestnet],
  ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
