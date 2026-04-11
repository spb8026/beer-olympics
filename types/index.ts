import { Timestamp } from "firebase/firestore";

export interface SiteConfig {
  accessCode: string;
  eventName: string;
  eventDate: Timestamp | null;
  location: string;
  bracketsVisible: boolean;
}

export interface Team {
  id: string;
  teamName: string;
  theme: string;
  players: string[];
  createdAt: Timestamp;
}

export interface FreeAgent {
  id: string;
  name: string;
  assignedTeamId: string | null;
  createdAt: Timestamp;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string[];
  order: number;
}

export type MatchStatus = "pending" | "active" | "complete";

export interface Match {
  matchId: string;
  team1Id: string | null;
  team1Name: string | null;
  score1: number | null;
  team2Id: string | null;
  team2Name: string | null;
  score2: number | null;
  winnerId: string | null;
  status: MatchStatus;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface Bracket {
  gameId: string;
  generated: boolean;
  rounds: Round[];
  updatedAt: Timestamp | null;
}

export interface Invite {
  id: string;
  name: string;
  coming: boolean;
  createdAt: Timestamp;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  games: Record<string, number>; // gameId -> points
  bonus: number;
}
