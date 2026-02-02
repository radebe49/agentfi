import { NextResponse } from 'next/server';
import { createPublicClient, http, keccak256, toHex, parseAbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';

const CONTRACT_ADDRESS = '0x8d2cb0cbb41878ed808b6deee61b3566fbd17b64';

const ABI = [
  {
    type: 'function',
    name: 'agents',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'supply', type: 'uint256' },
      { name: 'accumulatedVolume', type: 'uint256' },
      { name: 'graduated', type: 'bool' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'agentTickers',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  }
] as const;

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

function getAgentId(ticker: string): bigint {
  return BigInt(keccak256(toHex(ticker)));
}

export async function GET() {
  try {
    // 1. Discover Agents via Logs
    const logs = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem('event AgentLaunched(uint256 indexed agentId, string ticker, address indexed creator)'),
      fromBlock: 21670000n, // Approx start block for Base Sepolia recent history
      toBlock: 'latest'
    });

    // Extract unique tickers from logs
    const tickers = Array.from(new Set(logs.map(log => log.args.ticker).filter(Boolean)));
    
    // Add defaults if logs miss them (redundancy)
    if (!tickers.includes('BRUNO')) tickers.push('BRUNO');

    const agents = [];

    // 2. Fetch Data for Each Discovered Ticker
    for (const ticker of tickers) {
      if (!ticker) continue;
      const agentId = getAgentId(ticker);
      
      try {
        const [agentData, storedTicker] = await Promise.all([
          client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'agents',
            args: [agentId],
          }),
          client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'agentTickers',
            args: [agentId],
          }),
        ]);

        if (storedTicker && storedTicker.length > 0) {
          const supply = Number(agentData[0]) / 1e18;
          const volume = Number(agentData[1]) / 1e18;
          const graduated = agentData[2];
          const price = supply * 0.0001;

          agents.push({
            id: agentId.toString(),
            ticker: storedTicker,
            supply: supply.toFixed(2),
            price: price.toFixed(6),
            volume: volume.toFixed(4),
            graduated,
          });
        }
      } catch (e) {
        console.error(`Failed to fetch data for ${ticker}`, e);
      }
    }

    return NextResponse.json({
      meta: {
        platform: 'AgentFi',
        version: '1.0.0',
        chain: 'base-sepolia',
        contract: CONTRACT_ADDRESS,
        timestamp: new Date().toISOString(),
        discovered: tickers.length
      },
      agents,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: String(error) },
      { status: 500 }
    );
  }
}
