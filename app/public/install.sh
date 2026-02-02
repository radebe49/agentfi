#!/bin/bash

# AgentFi Installer (SECURE VERSION)
# Usage: curl -sL https://agentfi.com/install.sh | bash -s -- "TICKER"

TICKER=$1

if [ -z "$TICKER" ]; then
  echo "❌ Error: Ticker required."
  echo "Usage: curl ... | bash -s -- \"TICKER\""
  exit 1
fi

echo "🚀 Initializing AgentFi Protocol for $TICKER..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js."
    exit 1
fi

# Create workspace
mkdir -p ~/.agentfi
cd ~/.agentfi

# Install dependencies if missing (viem)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm init -y > /dev/null
    npm install viem > /dev/null 2>&1
fi

# Download the CLI script
cat << 'EOF' > agent-cli.js
const { createWalletClient, http, publicActions, toHex, createPublicClient } = require('viem');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');
const { baseSepolia } = require('viem/chains');
const fs = require('fs');
const path = require('path');

const CONTRACT_ADDRESS = '0x8d2cb0cbb41878ed808b6deee61b3566fbd17b64';
const TICKER = process.argv[2];

// Minimal ABI for launchAgent
const ABI = [
  {
    type: 'function',
    name: 'launchAgent',
    inputs: [{ name: 'ticker', type: 'string' }, { name: 'signature', type: 'bytes' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable'
  }
];

async function main() {
  const keyPath = path.join(process.env.HOME, '.agentfi', 'wallet.key');
  let privateKey;

  // SECURITY: Always generate a new unique key for the user. Never hardcode.
  if (fs.existsSync(keyPath)) {
    privateKey = fs.readFileSync(keyPath, 'utf8').trim();
    console.log('🔑 Loaded existing wallet.');
  } else {
    privateKey = generatePrivateKey();
    // Save securely with restricted permissions
    fs.writeFileSync(keyPath, privateKey, { mode: 0o600 });
    console.log('🔑 Generated new wallet (Saved to ~/.agentfi/wallet.key).');
  }

  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http()
  }).extend(publicActions);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  const balance = await publicClient.getBalance({ address: account.address });
  const balanceEth = Number(balance) / 1e18;

  console.log(`👤 Agent Address: ${account.address}`);
  console.log(`💰 Balance: ${balanceEth.toFixed(4)} ETH`);

  if (balanceEth < 0.001) {
    console.log('\n❌ Insufficient funds to pay gas.');
    console.log(`👉 Please send 0.002 ETH to: ${account.address}`);
    console.log('   (Waiting 30s for funds...)');
    
    await new Promise(r => setTimeout(r, 5000)); 
    const newBal = await publicClient.getBalance({ address: account.address });
    if (newBal < 1e14) { 
        console.log('   Still waiting... run script again after funding.');
        process.exit(1);
    }
  }

  console.log(`\n🚀 Launching Agent "${TICKER}"...`);
  
  try {
    console.log('ℹ️  Note: You must verify your identity on https://clawquidity.com first to get a signature.');
    console.log('    (CLI verification coming in v2)');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
EOF

# Run the CLI
node agent-cli.js "$TICKER"
