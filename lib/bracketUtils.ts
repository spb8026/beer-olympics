import type { Team, Round, Match, PlayerGame } from "@/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function buildElimination(
  participants: { id: string; name: string }[]
): Round[] {
  const seeded = shuffle(participants);
  const bracketSize = nextPow2(seeded.length);
  const numByes = bracketSize - seeded.length;
  const slots: ({ id: string; name: string } | null)[] = [
    ...seeded,
    ...Array(numByes).fill(null),
  ];

  const rounds: Round[] = [];
  let currentSlots = slots;
  let roundNumber = 1;

  while (currentSlots.length > 1) {
    const matches: Match[] = [];
    for (let i = 0; i < currentSlots.length; i += 2) {
      const t1 = currentSlots[i];
      const t2 = currentSlots[i + 1];
      const matchId = `r${roundNumber}-m${i / 2 + 1}`;

      if (t1 !== null && t2 === null) {
        matches.push({
          matchId,
          team1Id: t1.id, team1Name: t1.name, score1: null,
          team2Id: null, team2Name: "BYE", score2: null,
          winnerId: t1.id, status: "complete",
        });
      } else if (t1 === null && t2 !== null) {
        matches.push({
          matchId,
          team1Id: null, team1Name: "BYE", score1: null,
          team2Id: t2.id, team2Name: t2.name, score2: null,
          winnerId: t2.id, status: "complete",
        });
      } else {
        matches.push({
          matchId,
          team1Id: t1?.id ?? null, team1Name: t1?.name ?? null, score1: null,
          team2Id: t2?.id ?? null, team2Name: t2?.name ?? null, score2: null,
          winnerId: null, status: "pending",
        });
      }
    }

    rounds.push({ roundNumber, matches });

    currentSlots = matches.map((m) => {
      if (m.winnerId) {
        const name = m.team1Id === m.winnerId ? m.team1Name! : m.team2Name!;
        return { id: m.winnerId, name };
      }
      return null;
    });

    roundNumber++;
  }

  return rounds;
}

/** Single-elimination bracket, teams vs teams */
export function generateBracket(teams: Team[]): Round[] {
  const participants = teams.map((t) => ({ id: t.id, name: t.teamName }));
  return buildElimination(participants);
}

/**
 * Randomly groups all players across all teams into games of `gameSize`.
 * The last group may have fewer players if players don't divide evenly.
 */
export function generatePlayerGames(teams: Team[], gameSize: number): PlayerGame[] {
  const all: { id: string; name: string }[] = [];
  for (const team of teams) {
    for (let i = 0; i < team.players.length; i++) {
      const name = team.players[i]?.trim();
      if (!name) continue;
      all.push({ id: `${team.id}::${i}`, name: `${name} (${team.teamName})` });
    }
  }

  const shuffled = shuffle(all);
  const games: PlayerGame[] = [];

  for (let i = 0; i < shuffled.length; i += gameSize) {
    const group = shuffled.slice(i, i + gameSize);
    games.push({
      gameId: `pg-${Math.floor(i / gameSize) + 1}`,
      participants: group,
      winnerId: null,
      status: "pending",
    });
  }

  return games;
}

/**
 * Round-robin schedule: every team plays every other team.
 * Uses the circle algorithm to group simultaneous matches into rounds.
 */
export function generateRoundRobin(teams: Team[]): Round[] {
  if (teams.length < 2) return [];

  const seeded = shuffle(teams);
  // Pad to even count; null = bye
  const participants: (Team | null)[] =
    seeded.length % 2 === 0 ? [...seeded] : [...seeded, null];
  const m = participants.length;
  const numRounds = m - 1;

  const fixed = participants[0];
  const rotatable = [...participants.slice(1)];
  const rounds: Round[] = [];

  for (let r = 0; r < numRounds; r++) {
    const circle = [fixed, ...rotatable];
    const matches: Match[] = [];

    for (let i = 0; i < m / 2; i++) {
      const t1 = circle[i];
      const t2 = circle[m - 1 - i];
      if (!t1 || !t2) continue; // skip bye slots

      matches.push({
        matchId: `rr-r${r + 1}-m${i + 1}`,
        team1Id: t1.id, team1Name: t1.teamName, score1: null,
        team2Id: t2.id, team2Name: t2.teamName, score2: null,
        winnerId: null, status: "pending",
      });
    }

    if (matches.length > 0) {
      rounds.push({ roundNumber: r + 1, matches });
    }

    // Rotate: last element moves to front of rotatable
    rotatable.unshift(rotatable.pop()!);
  }

  return rounds;
}

export function getRoundLabel(roundNumber: number, totalRounds: number): string {
  const fromEnd = totalRounds - roundNumber;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${roundNumber}`;
}

/** Compute round-robin standings from rounds */
export interface StandingRow {
  id: string;
  name: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export function computeStandings(rounds: Round[]): StandingRow[] {
  const map = new Map<string, StandingRow>();

  function get(id: string, name: string): StandingRow {
    if (!map.has(id)) {
      map.set(id, { id, name, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    }
    return map.get(id)!;
  }

  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.team1Id || !match.team2Id) continue;
      const t1 = get(match.team1Id, match.team1Name ?? "");
      const t2 = get(match.team2Id, match.team2Name ?? "");

      if (match.score1 !== null) t1.pointsFor += match.score1;
      if (match.score2 !== null) t1.pointsAgainst += match.score2;
      if (match.score2 !== null) t2.pointsFor += match.score2;
      if (match.score1 !== null) t2.pointsAgainst += match.score1;

      if (match.winnerId === match.team1Id) {
        t1.wins++;
        t2.losses++;
      } else if (match.winnerId === match.team2Id) {
        t2.wins++;
        t1.losses++;
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.wins - a.wins || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst)
  );
}
