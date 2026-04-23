import { Timestamp } from "firebase/firestore";

export interface SiteConfig {
  accessCode: string;
  eventName: string;
  eventDate: Timestamp | null;
  location: string;
  bracketsVisible: boolean;
  photosVisible: boolean;
  teamSize?: 2 | 4;
}

export interface Team {
  id: string;
  teamName: string;
  theme: string;
  players: string[];
  photoUrl?: string;
  createdAt: Timestamp;
}

export interface FreeAgent {
  id: string;
  name: string;
  assignedTeamId: string | null;
  createdAt: Timestamp;
}

export type GameType = "team-bracket" | "player-game" | "round-robin" | "paired-round-robin" | "none";

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string[];
  order: number;
  gameType: GameType;
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

export interface PlayerGameParticipant {
  id: string;   // "teamId::playerIndex"
  name: string; // "PlayerName (Team Name)"
}

export interface PlayerGame {
  gameId: string;
  participants: PlayerGameParticipant[];
  winnerId: string | null;
  status: MatchStatus;
}

export interface TeamPair {
  pairId: string;
  teamIds: [string, string];
  teamNames: [string, string];
  pairName: string;
}

export interface Bracket {
  gameId: string;
  generated: boolean;
  rounds: Round[];
  playerGames?: PlayerGame[];
  gameSize?: number;
  pairings?: TeamPair[];
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
  games: Record<string, number>; // gameId -> points (team games only)
  bonus: number;
}

export interface PlayerScore {
  playerId: string;   // "teamId::playerIndex"
  playerName: string;
  teamId: string;
  teamName: string;
  games: Record<string, number>; // gameId -> points (player games only)
}

export type PotluckCategory = "Appetizer" | "Main Dish" | "Side" | "Dessert" | "Drinks" | "Other";

export interface PotluckSignup {
  id: string;
  name: string;
  item: string;
  category: PotluckCategory;
  createdAt: Timestamp;
}

export interface Photo {
  id: string;
  url: string;
  publicId: string;
  uploadedBy: string;
  votes: number;
  createdAt: Timestamp;
}

export interface Rsvp {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: Timestamp;
}
