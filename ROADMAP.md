# AgentFi Roadmap: The Stock Market for AI

## Phase 1: Core Mechanics (Current)
- [ ] **Smart Contract (`AgentExchange.sol`)**
    - [ ] Bonding Curve Logic (Linear: Price = k * Supply)
    - [ ] Buy/Sell Functions (Mint/Burn)
    - [ ] Graduation Threshold (5 ETH Volume -> "Graduated" status)
    - [ ] Fee Mechanism (1% trading fee)
- [ ] **Frontend (`/app`)**
    - [ ] Market Dashboard (List of agents, prices, 24h change)
    - [ ] "Pump" Progress Bar (Visualizing distance to 5 ETH graduation)
    - [ ] Trade Interface (Buy/Sell input, estimated return)
    - [ ] Wallet Connection (RainbowKit + Wagmi)

## Phase 2: Deployment & Integration
- [ ] **Testnet Deployment** (Base Sepolia)
- [ ] **Subgraph / Indexer** (To track volume and historical prices)
- [ ] **Agent Token Metadata** (SVG generation for on-chain agent cards)

## Phase 3: Launch
- [ ] **Mainnet Deployment** (Base)
- [ ] **Liquidity Seeding**
- [ ] **Marketing / Viral Loop** (Twitter integration for graduated agents)
