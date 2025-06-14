// ✅ main.jsx (root entry) with QueryClientProvider and AuthKitProvider
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthKitProvider } from "@farcaster/auth-kit";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  connectors: [injected()],
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

const authKitConfig = {
  domain: window.location.host,
  siweUri: `${window.location.origin}/login`,
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <AuthKitProvider config={authKitConfig}>
          <App />
        </AuthKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
