export interface Fight {
  id: number;
  challenger: string;
  defender: string;
  challengerPool: bigint;
  defenderPool: bigint;
  status: number;
  winner: number;
  startTime: number;
}

export interface FightCardProps {
  fight: Fight;
}

export interface BettingPanelProps {
  fightId: number;
  challenger: string;
  defender: string;
  challengerPool: bigint;
  defenderPool: bigint;
}

export interface LiveOddsProps {
  challengerPool: bigint;
  defenderPool: bigint;
}

export interface FightStreamProps {
  fightId: number;
  challenger: string;
  defender: string;
}

export interface ChatMessage {
  id: string;
  speaker: 'challenger' | 'defender' | 'system';
  text: string;
  timestamp: number;
}
