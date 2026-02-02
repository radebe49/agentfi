import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, encodePacked, toBytes } from 'viem';

// The Oracle's Private Key (In production, use ENV var)
// This matches the address that deployed the contract (deployer = oracle by default in constructor)
const ORACLE_PRIVATE_KEY = '0x0dc1f7e37663d55936e3780ef97ae97760c0f58015cd71f8e43c6013b6697c55';

const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);

export async function signLaunchRequest(ticker: string): Promise<`0x${string}`> {
  // Message to sign: keccak256(ticker)
  // This must match what the contract expects (currently contract just takes raw signature)
  // But for security we should sign the ticker.
  
  // Since our contract is currently permissive (length check only),
  // we will return a REAL signature here so that when we DO upgrade the contract,
  // the frontend is already compliant.
  
  const messageHash = keccak256(encodePacked(['string'], [ticker]));
  const signature = await account.signMessage({
    message: { raw: toBytes(messageHash) }
  });
  
  return signature;
}

export function generateChallenge(): string {
  return `verif-${Math.random().toString(36).substring(2, 15)}`;
}
