import { NextResponse } from 'next/server';
import { generateChallenge } from '@/lib/oracle';

// In-memory store for challenges (In prod, use Redis/DB)
// Map<handle, challenge>
export const challenges = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { handle, platform } = await req.json();
    
    if (!handle || platform !== 'twitter') {
      return NextResponse.json({ error: 'Invalid handle or platform' }, { status: 400 });
    }

    const challenge = generateChallenge();
    challenges.set(handle.toLowerCase(), challenge);

    return NextResponse.json({ 
      challenge,
      instructions: `Please add the following code to your Twitter Bio or a new Tweet: ${challenge}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
