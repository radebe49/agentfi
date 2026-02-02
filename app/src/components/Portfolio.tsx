'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import { AGENT_EXCHANGE_ADDRESS } from './Web3Provider';
import AgentExchangeABI from '@/lib/abi/AgentExchange.json';

interface Agent {
  id: string;
  ticker: string;
  price: string;
}

export function Portfolio() {
  const { address, isConnected } = useAccount();
  const [agents, setAgents] = useState<Agent[]>([]);

  // 1. Fetch all known agents to check balances against
  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(console.error);
  }, []);

  // 2. Prepare contract calls for all agents
  const contracts = agents.map(agent => ({
    address: AGENT_EXCHANGE_ADDRESS,
    abi: AgentExchangeABI,
    functionName: 'balances',
    args: [BigInt(agent.id), address],
  }));

  // 3. Bulk read balances
  const { data: balances, isLoading } = useReadContracts({
    contracts: isConnected && agents.length > 0 ? contracts : [],
    query: {
      refetchInterval: 5000, // Auto-refresh every 5s
    }
  });

  // 4. Filter holdings
  const holdings = agents.map((agent, i) => {
    const balance = balances?.[i]?.result ? formatEther(balances[i].result as bigint) : '0';
    return { ...agent, balance };
  }).filter(h => parseFloat(h.balance) > 0);

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span>💼</span> My Portfolio
      </h3>

      {!isConnected ? (
        <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl bg-black/20">
          <div className="text-gray-500 mb-2">Wallet Disconnected</div>
          <p className="text-xs text-gray-600 mb-4">Connect to view your holdings</p>
        </div>
      ) : isLoading ? (
        <div className="animate-pulse text-center py-8 text-gray-500">Loading balances...</div>
      ) : holdings.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl bg-black/20">
          <div className="text-gray-500 mb-2">No active positions</div>
          <p className="text-xs text-gray-600 mb-4">Buy agent tokens to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holdings.map(holding => (
            <div key={holding.id} className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
              <div>
                <div className="font-mono font-bold text-sm text-cyan-400">{holding.ticker}</div>
                <div className="text-xs text-gray-500">Price: {holding.price} ETH</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-white">{parseFloat(holding.balance).toFixed(2)}</div>
                <div className="text-xs text-gray-500">SHARES</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
