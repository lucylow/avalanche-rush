import { createConfig, http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Wagmi configuration for Avalanche Rush
export const config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: 'your-walletconnect-project-id', // Replace with actual project ID
    }),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
});

export default config;

