# 📉 Full Production Gap Analysis (The Brutal Truth - v2)
*Status: Pre-Alpha (NOT Production Ready)*
*Date: 2026-02-02*
*Auditor: Bruno (AI Lieutenant)*

## 🚨 Critical Functional Failures (Must Fix Immediately)

### 1. The "Fake" Wallet Connection
- **Component**: `Header.tsx`
- **Issue**: The "Connect Wallet" button is a plain HTML `<button>`. It does **absolutely nothing**.
- **Impact**: Users cannot connect, cannot trade, cannot see balances. The platform is bricked for humans.
- **Fix**: Replace with RainbowKit's `<ConnectButton />`.

### 2. The "Fake" Portfolio
- **Component**: `Portfolio.tsx`
- **Issue**: Displays hardcoded "No active positions". It has **zero** logic to fetch user balances from the contract.
- **Impact**: Investors cannot track their PnL or holdings.
- **Fix**: Implement `useReadContract` loop to fetch `balances[agentId][user]` for all known agents.

### 3. The "Missing" Launchpad
- **Component**: `Header.tsx` ("Launch" link)
- **Issue**: The "Launch" link is just an anchor tag `href="#"`. Clicking it does nothing.
- **Impact**: Humans cannot launch agents.
- **Fix**: Build `LaunchModal.tsx` and wire it to the header link.

### 4. The "Unsellable" Token
- **Component**: `AgentMarket.tsx` (TradeModal)
- **Issue**: The `sell()` function requires the user to **approve** the contract to spend their tokens first?
    - *Correction*: This is a bonding curve, tokens are internal to the contract. `sell()` burns them. **Approval is NOT needed** (Good news).
    - *However*: The UI does not check if the user *has* enough balance to sell. It just tries to send the tx.
- **Fix**: Add balance check in `TradeModal` before enabling the "Sell" button.

### 5. Missing Metadata & SEO
- **Component**: `layout.tsx` / `page.tsx`
- **Issue**: No OpenGraph tags, no Twitter Card tags, default Next.js metadata.
- **Impact**: Sharing links on Twitter/Moltbook will look like a broken site.
- **Fix**: Add `export const metadata` with title, description, and OG images.

### 6. Mobile Responsiveness Gaps
- **Component**: `AgentMarket.tsx`
- **Issue**: Table view breaks on mobile. Need a card view or scrolling container.
- **Impact**: 50% of users (mobile) will see a broken layout.
- **Fix**: Add `overflow-x-auto` to table container (present) but refine columns for mobile.

---

## ⚠️ UX/UI Gaps (Polished but Hollow)

### 7. Static Watchlist
- **Component**: `Portfolio.tsx`
- **Issue**: Hardcoded "ELIZA", "AUTONOUS", "TRUTH". Users cannot add agents to watchlist.
- **Fix**: LocalStorage-based watchlist.

### 8. No Transaction Feedback
- **Component**: `TradeModal.tsx`
- **Issue**: After clicking "Buy", there is no "Success/Fail" toast or notification. The modal just stays there.
- **Fix**: Add Wagmi `useWaitForTransactionReceipt` + Toast notifications (Sonner/Hot-Toast).

### 9. No Real-Time Price Updates
- **Component**: `AgentMarket.tsx`
- **Issue**: Prices only update on page refresh (API call).
- **Fix**: Use Wagmi `useWatchContractEvent` to listen for `TokensBought`/`TokensSold` and auto-refresh data.

### 10. Hardcoded "Known Tickers"
- **Component**: `/api/agents/route.ts`
- **Issue**: The API only checks a hardcoded list: `['RADEBE', 'ELIZA', 'BRUNO', 'GPT', 'CLAUDE']`. If someone launches "VADER", it won't show up.
- **Fix**: We need an indexer (The Graph or a simple event listener script) to discover *new* agents dynamically. (For MVP: We can keep the list but we must allow adding to it via the Launch UI).

---

## 🛠️ Execution Plan: "Operation Realify"

### Step 1: Fix the Wallet (The Key)
- Replace `Header.tsx` button with `<ConnectButton />`.
- Verify connection works.

### Step 2: Build the Launchpad (The Supply)
- Create `components/LaunchModal.tsx`.
- Connect to `launchAgent` contract function.
- Add "Launch" button to Header.

### Step 3: Real Portfolio (The Demand)
- Update `Portfolio.tsx` to read actual balances.
- Show $0.00 if disconnected.

### Step 4: One-Line Install (The Agent Growth)
- Create `public/install.sh`.
- Update `SKILL.md`.

### Step 5: SEO & Metadata
- Add metadata to `layout.tsx`.

---

## 📉 Confidence Rating: 35%
Added Metadata and Mobile gaps to the list. The platform is currently a "Potemkin Village" (looks real, but mostly facade).
