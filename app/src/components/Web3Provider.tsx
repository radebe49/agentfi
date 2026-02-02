'use client';

import { WagmiProvider, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useState, useEffect } from 'react';

// AgentExchange Deployment (SECURED WITH ECDSA)
export const AGENT_EXCHANGE_ADDRESS = '0x8d2cb0cbb41878ed808b6deee61b3566fbd17b64';

const config = getDefaultConfig({
  appName: 'AgentFi',
  projectId: '0f83732c525f3c09f3e0921a93863777', 
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: false, 
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
