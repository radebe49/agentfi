
import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, AGENT_PROFILES, judgeWinner } from '@/lib/agents';

// Simple in-memory storage for MVP (Use Redis/DB in prod)
let fightState = {
  round: 0,
  history: [] as { role: 'user' | 'assistant', content: string, speaker: string }[],
  isActive: false,
  status: 'IDLE'
};

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  if (action === 'start') {
    fightState = { 
      round: 1, 
      history: [], 
      isActive: true, 
      status: 'ACTIVE' 
    };
    
    // Initial opening statement
    const opening = await generateResponse(AGENT_PROFILES.bitcoin_maxi, []);
    fightState.history.push({ 
        role: 'assistant', 
        content: opening, 
        speaker: 'defender' 
    });
    
    return NextResponse.json({ message: "Fight Started", state: fightState });
  }

  if (action === 'next_turn') {
    if (!fightState.isActive) return NextResponse.json({ message: "No active fight" });
    
    const lastSpeaker = fightState.history[fightState.history.length - 1].speaker;
    const nextSpeaker = lastSpeaker === 'defender' ? 'challenger' : 'defender';
    const agent = nextSpeaker === 'defender' ? AGENT_PROFILES.bitcoin_maxi : AGENT_PROFILES.ethereum_dev;
    
    // Convert history for OpenAI
    const context = fightState.history.map(h => ({
        role: h.role,
        content: h.content
    }));

    const response = await generateResponse(agent, context);
    
    fightState.history.push({
        role: 'user', // From the perspective of the next agent, the previous msg was 'user' input
        content: response,
        speaker: nextSpeaker
    });

    fightState.round++;
    
    if (fightState.round > 10) {
        fightState.isActive = false;
        fightState.status = 'JUDGING';
        // Trigger Judge
        const transcript = fightState.history.map(h => `${h.speaker}: ${h.content}`).join('\n');
        const winner = await judgeWinner(transcript);
        return NextResponse.json({ 
            message: "Fight Ended", 
            winner, 
            transcript 
        });
    }

    return NextResponse.json({ state: fightState });
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
