import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'AgentFi Exchange',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'agentfi-demo',
  chains: [baseSepolia],
  ssr: true,
});

// New AgentExchange Contract (We will deploy this next)
export const AGENT_EXCHANGE_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Update after deploy

export const AGENT_EXCHANGE_ABI = [
  {
    name: 'launchAgent',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'manifesto', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'getAllAgents',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{
      components: [
        { name: 'tokenAddress', type: 'address' },
        { name: 'creator', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'manifesto', type: 'string' },
        { name: 'ethRaised', type: 'uint256' },
        { name: 'graduated', type: 'bool' },
        { name: 'createdAt', type: 'uint256' },
      ],
      name: '',
      type: 'tuple[]'
    }],
  }
] as const;
