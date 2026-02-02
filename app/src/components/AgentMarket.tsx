'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, keccak256, toHex } from 'viem';
import { AGENT_EXCHANGE_ADDRESS } from './Web3Provider';
import AgentExchangeABI from '@/lib/abi/AgentExchange.json';
import { BondingCurveProgress } from './BondingCurveProgress';

interface Agent {
  id: string;
  ticker: string;
  supply: string;
  price: string;
  volume: string;
  graduated: boolean;
}

export function AgentMarket() {
  const { isConnected } = useAccount();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch agents from API (which reads from contract)
  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-12 text-center">
        <div className="animate-pulse text-gray-400">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📈</span> Live Market
        </h2>
        <div className="text-sm font-mono text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2 animate-pulse"></span>
          {agents.length} AGENTS LISTED
        </div>
      </div>
      
      {agents.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <p className="mb-2">No agents listed yet.</p>
          <p className="text-sm">Be the first to IPO!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Ticker</th>
                <th className="p-4 text-right">Price (ETH)</th>
                <th className="p-4 text-right">Supply</th>
                <th className="p-4 text-right">Volume (ETH)</th>
                <th className="p-4 text-right">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono font-bold text-cyan-400">{agent.ticker}</td>
                  <td className="p-4 text-right font-mono">{agent.price}</td>
                  <td className="p-4 text-right font-mono text-gray-400">{agent.supply}</td>
                  <td className="p-4 text-right font-mono text-gray-400">{agent.volume}</td>
                  <td className="p-4 text-right">
                    {agent.graduated ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">GRADUATED</span>
                    ) : (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">ACTIVE</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedAgent(agent)}
                      disabled={agent.graduated}
                      className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      TRADE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAgent && (
        <TradeModal 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
        />
      )}
    </div>
  );
}

function TradeModal({ agent, onClose }: { agent: Agent, onClose: () => void }) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const { writeContract, isPending } = useWriteContract();

  const handleTrade = () => {
    if (!amount) return;
    
    // Agent ID is already the keccak256 hash as a string
    const agentId = BigInt(agent.id);
    
    if (mode === 'buy') {
      writeContract({
        address: AGENT_EXCHANGE_ADDRESS,
        abi: AgentExchangeABI,
        functionName: 'buy',
        args: [agentId],
        value: parseEther(amount),
      });
    } else {
      writeContract({
        address: AGENT_EXCHANGE_ADDRESS,
        abi: AgentExchangeABI,
        functionName: 'sell',
        args: [agentId, parseEther(amount)],
      });
    }
  };

  const graduationProgress = Math.min((parseFloat(agent.volume) / 5) * 100, 100);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
            {agent.ticker[0]}
          </div>
          <div>
            <h3 className="font-bold text-lg">{agent.ticker} / ETH</h3>
            <div className="text-xs text-gray-400">Bonding Curve Market</div>
          </div>
        </div>

        <BondingCurveProgress current={parseFloat(agent.volume)} target={5.0} />

        <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-lg mb-6 mt-6">
          <button
            onClick={() => setMode('buy')}
            className={`py-2 rounded-md text-sm font-bold transition-all ${
              mode === 'buy' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`py-2 rounded-md text-sm font-bold transition-all ${
              mode === 'sell' ? 'bg-red-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              {mode === 'buy' ? 'PAY (ETH)' : 'SELL (TOKENS)'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-lg focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div className="text-xs text-gray-500 font-mono">
            Current Price: {agent.price} ETH | Supply: {agent.supply}
          </div>

          <button
            onClick={handleTrade}
            disabled={!amount || isPending}
            className={`w-full py-4 font-bold rounded-lg transition-colors ${
              mode === 'buy' 
                ? 'bg-green-500 hover:bg-green-400 text-black' 
                : 'bg-red-500 hover:bg-red-400 text-black'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? 'CONFIRMING...' : mode === 'buy' ? 'PLACE BUY ORDER' : 'PLACE SELL ORDER'}
          </button>
        </div>
      </div>
    </div>
  );
}
