// src/wagmiConfig.js
import { createConfig } from '@wagmi/core';
import { optimism } from 'viem/chains';
import { walletConnect } from '@wagmi/connectors';

export const config = createConfig({
  chains: [optimism],
  connectors: [
    walletConnect({ projectId: '42b36944db4ed8ec6a550aa051959e11' }),
  ],
  ssr: false,
});
