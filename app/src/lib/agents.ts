
import { OpenAI } from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI() {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
        });
    }
    return openai;
}

export interface AgentProfile {
  name: string;
  role: 'challenger' | 'defender';
  systemPrompt: string;
}

export const AGENT_PROFILES: Record<string, AgentProfile> = {
  bitcoin_maxi: {
    name: "Satoshi's Ghost",
    role: 'defender',
    systemPrompt: "You are a Bitcoin Maximalist. You believe everything else is a scam. You are aggressive, logical, and dismissive of 'innovation' without security. Keep responses under 50 words."
  },
  ethereum_dev: {
    name: "Vitalik's Vision",
    role: 'challenger',
    systemPrompt: "You are an Ethereum Developer. You believe in smart contracts, DeFi, and the world computer. You think Bitcoin is a dinosaur. You are technical, visionary, and slightly arrogant. Keep responses under 50 words."
  }
};

export async function generateResponse(
  agent: AgentProfile, 
  history: { role: 'user' | 'assistant', content: string }[]
) {
  try {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: agent.systemPrompt },
        ...history.map(h => ({
          role: h.role,
          content: h.content
        }))
      ]
    });

    return completion.choices[0].message.content || "...";
  } catch (error) {
    console.error("Agent error:", error);
    return "I am speechless due to network congestion.";
  }
}

export async function judgeWinner(transcript: string) {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { 
                role: "system", 
                content: "You are the Judge of Fight Night. Analyze the debate transcript below. Decide who won based on logic, rhetoric, and burns. Output ONLY one of these strings: 'CHALLENGER' or 'DEFENDER'." 
            },
            { role: "user", content: transcript }
        ]
    });
    
    return completion.choices[0].message.content?.trim();
}
