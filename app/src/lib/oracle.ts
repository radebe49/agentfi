import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, encodePacked, toBytes } from 'viem';

// SECURITY: Use Environment Variable. 
// Do NOT hardcode private keys in source control.
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';

const account = privateKeyToAccount(ORACLE_PRIVATE_KEY as `0x${string}`);

export async function signLaunchRequest(ticker: string): Promise<`0x${string}`> {
  if (ORACLE_PRIVATE_KEY.startsWith('0x000')) {
    throw new Error('Oracle Private Key not configured on server.');
  }

  const messageHash = keccak256(encodePacked(['string'], [ticker]));
  const signature = await account.signMessage({
    message: { raw: toBytes(messageHash) }
  });
  
  return signature;
}

export function generateChallenge(): string {
  return `verif-${Math.random().toString(36).substring(2, 15)}`;
}
