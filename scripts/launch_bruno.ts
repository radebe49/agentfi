import { createWalletClient, http, publicActions, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import AgentExchangeABI from '../out/AgentExchange.sol/AgentExchange.json';

const PRIVATE_KEY = '0x0dc1f7e37663d55936e3780ef97ae97760c0f58015cd71f8e43c6013b6697c55';
const CONTRACT_ADDRESS = '0x1d27ab8fCd27caE44965CF07E61f7F9Df6D14803';

async function main() {
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http()
  }).extend(publicActions);

  console.log(`🚀 Launching Agent "BRUNO" from ${account.address}...`);

  try {
    // Generate a dummy signature (contract only checks length > 0 for now)
    const signature = toHex('dummy_signature');

    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: AgentExchangeABI.abi,
      functionName: 'launchAgent',
      args: ['BRUNO', signature],
    });

    console.log(`✅ Transaction sent: ${hash}`);
    
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log(`🎉 Transaction confirmed! Block: ${receipt.blockNumber}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
