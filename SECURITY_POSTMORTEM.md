# 🛡️ Security Post-Mortem: The "Default Key" Sweeper Attack

## 1. The Anatomy of the Attack
The attack that drained your wallet is known as an **Automated Sweeper** or **Scavenger Bot**.

### The Setup (The Trap)
Hackers maintain a database of "Compromised Private Keys". This list includes:
- **Default Dev Keys**: From Foundry (`0x0dc1...`), Hardhat, Ganache, Anvil.
- **Leaked Keys**: Scraped from GitHub searches (files named `secret.js`, `.env` committed by mistake).
- **Weak Brainwallets**: Keys generated from simple phrases like "password".

### The Trigger (The Watchtower)
The bot connects to a blockchain node (via WebSocket) and subscribes to `pendingTransactions`.
It sees every transaction *before* it is confirmed.

### The Execution (The Race)
1.  **Detection**: You broadcast a tx sending ETH to `0x9082...`.
2.  **Simulation**: The bot simulates the state: "If I have the key to `0x9082...`, can I move this ETH?"
3.  **Construction**: The bot creates a transaction: `Transfer ALL from 0x9082... to BotAddress`.
4.  **Bribing (Gas War)**: The bot sets a **Gas Price** significantly higher than the network average (e.g., 50 gwei vs 5 gwei).
    -   Miners/Validators are economically incentivized to include the Bot's transaction *immediately*.
    -   On some chains, they use **Flashbots bundles** to guarantee their transaction lands in the *same block* as your deposit, immediately after it.

## 2. Why It Was So Fast
It wasn't a human. It was code reacting in <100ms.
-   **Node Latency**: ~50ms
-   **Processing**: ~10ms
-   **Broadcast**: ~50ms
**Total Time**: ~0.1 seconds. By the time your UI showed "Confirmed", the money was already gone.

## 3. Defense & Prevention (How to Never Lose Again)

### A. The Golden Rule: Generation
**NEVER** use a key you didn't generate yourself using a cryptographically secure random number generator (CSPRNG).

**❌ Unsafe:**
-   Copying keys from tutorials/docs.
-   Using "test" keys from frameworks.
-   Generating keys with `Math.random()` (not secure).

**✅ Safe:**
-   **Foundry**: `cast wallet new`
-   **Metamask**: Create New Account.
-   **OpenClaw**: `openssl rand -hex 32` (then import as private key).

### B. The Storage: Environment Variables
Never put keys in code (`const KEY = '...'`).
Always use `.env` files and add `.env` to `.gitignore`.

```bash
# .env (Correct)
PRIVATE_KEY=0x_REAL_RANDOM_KEY_HERE
```

```javascript
// code.js (Correct)
const key = process.env.PRIVATE_KEY;
```

### C. The Safety Net: Git Hooks
Install tools like `git-secrets` or use GitHub's **Secret Scanning**.
These tools scan your commits *before* you push. If they see a string that looks like a Private Key, they block the push.

### D. The Burner Strategy
For development (like AgentFi):
1.  Generate a **Fresh Burner Wallet** for the project (`cast wallet new`).
2.  Send **only** enough Testnet ETH for gas (0.1 ETH).
3.  **Never** send Mainnet ETH to a dev wallet.
4.  Discard the wallet when the project is done.

## 4. Summary
You fell victim to the "Foundry Default Key" trap. It is a rite of passage for many developers. The lesson is expensive but permanent: **Trust only the keys you forge yourself.**
