# 🚀 Mission: AgentFi Realify
*Status: Active*
*Objective: Convert the "Potemkin Village" prototype into a fully functional Agentic Stock Market.*

## 🗺️ Mission Phases

### 🔴 Phase 1: The "Agent-First" Onboarding (Top Priority)
**Goal**: An autonomous agent can join AgentFi and IPO with a single bash command.
*Reference: Moltbook / OpenClaw connection pattern.*

- [ ] **Task 1.1**: Create `public/install.sh` (The curl target).
  - Logic: Detects OS, checks for Node, downloads CLI wrapper.
- [ ] **Task 1.2**: Create `scripts/agent-cli.js` (The wrapper).
  - Logic: Generates wallet, requests funds (or asks user), calls `launchAgent(ticker)` on chain.
- [ ] **Task 1.3**: Update `SKILL.md`.
  - Instruction: `curl -sL https://agentfi.com/install.sh | bash -s -- "MY_TICKER"`

### 🟠 Phase 2: The Human Interface (Fixing Critical Gaps)
**Goal**: Humans can connect wallets and trade without looking at code.

- [ ] **Task 2.1**: **Fix Wallet Connection** (`Header.tsx`).
  - Replace fake button with `<ConnectButton />`.
- [ ] **Task 2.2**: **Build Launchpad** (`LaunchModal.tsx`).
  - Allow humans to click "Launch", enter Ticker, and sign transaction.
- [ ] **Task 2.3**: **Real Portfolio** (`Portfolio.tsx`).
  - Fetch `balances[agentId][user]` for all known agents.

### 🟡 Phase 3: Data & Reliability
**Goal**: The numbers on screen are real and update automatically.

- [ ] **Task 3.1**: **Real-Time Prices** (`AgentMarket.tsx`).
  - Listen for `TokensBought` events to update price/supply instantly.
- [ ] **Task 3.2**: **Dynamic Discovery** (`/api/agents`).
  - Stop hardcoding tickers. Add a mechanism (e.g., event logs or a simple registry file) to list ALL launched agents.
- [ ] **Task 3.3**: **Transaction Feedback**.
  - Add toast notifications for "Transaction Sent" and "Confirmed".

### 🟢 Phase 4: Polish & Production
**Goal**: Ready for public viral sharing.

- [ ] **Task 4.1**: **SEO & Metadata** (`layout.tsx`).
  - Add OpenGraph tags, Twitter cards, and description.
- [ ] **Task 4.2**: **Mobile Layout Fixes**.
  - Ensure table scrolls horizontally on mobile.

---

## 🏁 Success Criteria
1. I can run `curl ... | bash` in a terminal and see my agent appear on the dashboard.
2. I can click "Connect Wallet", buy shares of that agent, and see them in my Portfolio.
3. I can refresh the page and see my portfolio persist.

*Mission Start: 2026-02-02*
