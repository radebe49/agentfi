# 📉 Gap Analysis & Execution Plan: AgentFi Production
*Status: Pre-Alpha → Production Candidate*

## 1. Current State Assessment
We have a working **Engine** (Contract + API) but a hollow **Cockpit** (UI).

| Component | Status | Reality Check |
| :--- | :--- | :--- |
| **Contract** | 🟢 Ready | `0x1d27...803` is live. Math is sound. |
| **API** | 🟢 Ready | `/api/agents` reads live chain data (Viem). |
| **Agent Market** | 🟡 Partial | Connects to API, but some UI elements (Watchlist) are static. |
| **Portfolio** | 🔴 Mock | Displays "No active positions" hardcoded. No chain reads. |
| **Launch UI** | 🔴 Missing | "Launch" link in header is dead. Humans cannot deploy easily. |
| **Agent Onboarding** | 🟡 High Friction | `SKILL.md` exists, but requires manual coding. Needs a script. |

---

## 2. The "Agent Native" Install Strategy
*Inspiration: Moltbook / OpenClaw `curl | bash` pattern.*

**Goal:** An agent should be able to join AgentFi in 1 command.
**Solution:** Create `public/install.sh`.

```bash
# Concept
curl -sL https://agentfi.com/install.sh | bash -s -- "MY_TICKER"
```

**Script Logic:**
1. Generate a burner wallet (if none exists).
2. Fund it (ask user or faucet).
3. Call `launchAgent(ticker)`.
4. Output: "You are live. Post this to verify: [Signature]"

---

## 3. Step-by-Step Implementation Plan

### Phase 1: The Human Launchpad (Priority: High)
*Humans provide the initial capital. We must let them create agents easily.*
- [ ] Create `components/LaunchModal.tsx`.
- [ ] Connect `launchAgent` function to UI.
- [ ] Handle "Oracle Signature" (Mock for now: allow any signature in UI).

### Phase 2: Real Portfolio (Priority: High)
*Investors need to see their PnL.*
- [ ] Update `Portfolio.tsx` to read `balanceOf(user)` for all listed agents.
- [ ] Calculate USD/ETH value of holdings.
- [ ] Remove hardcoded "Watchlist".

### Phase 3: The "One-Line" Agent Install (Priority: Medium)
*Reduce friction for autonomous agents.*
- [ ] Create `app/public/install.sh`.
- [ ] Write a simple Node.js CLI wrapper (`scripts/agent-cli.js`) that the shell script downloads and runs.
- [ ] Update `SKILL.md` to feature this command prominently.

### Phase 4: Polish & Verify
- [ ] **Verification**: Launch "AGENT_X" via the UI (Human path).
- [ ] **Verification**: Launch "AGENT_Y" via the `install.sh` (Agent path).
- [ ] **Verification**: Buy "AGENT_X" and see it appear in Portfolio.

---

## 4. Immediate Action Items
1.  **Refactor `Portfolio.tsx`** to use `useReadContracts` (Wagmi) to fetch balances for all agents returned by the API.
2.  **Build `LaunchModal.tsx`** so you (Radebe) can launch more test agents easily.
3.  **Write `install.sh`** to put in the public folder.

*Ready to execute Phase 1?*
