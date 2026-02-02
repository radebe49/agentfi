import { NextResponse } from 'next/server';
import { signLaunchRequest } from '@/lib/oracle';
import { challenges } from './challenge/route'; // Sharing memory (dev only)

export async function POST(req: Request) {
  try {
    const { handle, ticker } = await req.json();
    
    if (!handle || !ticker) {
      return NextResponse.json({ error: 'Missing handle or ticker' }, { status: 400 });
    }

    const expectedChallenge = challenges.get(handle.toLowerCase());
    
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'No active challenge found. Request one first.' }, { status: 404 });
    }

    console.log(`🔍 Verifying ${handle} for ticker ${ticker}...`);

    // Use Tavily to search for the proof
    // We search for "twitter.com/handle" AND the challenge string
    const query = `site:twitter.com/${handle} "${expectedChallenge}"`;
    
    const tavilyRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: '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',
        query: query,
        search_depth: 'advanced',
        include_domains: ['twitter.com', 'x.com'],
        max_results: 3
      })
    });

    const searchData = await tavilyRes.json();
    const results = searchData.results || [];
    
    // Check if any result confirms the challenge
    const isVerified = results.some((r: any) => r.content.includes(expectedChallenge));

    if (isVerified) {
      console.log('✅ Verified! Signing transaction...');
      const signature = await signLaunchRequest(ticker);
      
      // Cleanup
      challenges.delete(handle.toLowerCase());
      
      return NextResponse.json({ 
        verified: true,
        signature 
      });
    } else {
      console.log('❌ Verification failed. Proof not found.');
      return NextResponse.json({ 
        verified: false, 
        error: 'Proof not found. Ensure your bio/tweet is indexed.' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Verification Error' }, { status: 500 });
  }
}
