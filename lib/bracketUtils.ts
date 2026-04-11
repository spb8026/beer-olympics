import type { Team, Round, Match } from "@/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Next power of 2 >= n */
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Generates a single-elimination bracket from a list of teams.
 * Byes are represented as matches where one slot is null (auto-advances).
 */
export function generateBracket(teams: Team[]): Round[] {
  const seeded = shuffle(teams);
  const bracketSize = nextPow2(seeded.length);
  const numByes = bracketSize - seeded.length;

  // Pad with nulls for byes
  const slots: (Team | null)[] = [...seeded, ...Array(numByes).fill(null)];

  const rounds: Round[] = [];
  let currentSlots = slots;
  let roundNumber = 1;

  while (currentSlots.length > 1) {
    const matches: Match[] = [];
    for (let i = 0; i < currentSlots.length; i += 2) {
      const t1 = currentSlots[i];
      const t2 = currentSlots[i + 1];
      const matchId = `r${roundNumber}-m${i / 2 + 1}`;

      // Auto-advance byes
      if (t1 !== null && t2 === null) {
        matches.push({
          matchId,
          team1Id: t1.id,
          team1Name: t1.teamName,
          score1: null,
          team2Id: null,
          team2Name: "BYE",
          score2: null,
          winnerId: t1.id,
          status: "complete",
        });
      } else if (t1 === null && t2 !== null) {
        matches.push({
          matchId,
          team1Id: null,
          team1Name: "BYE",
          score1: null,
          team2Id: t2.id,
          team2Name: t2.teamName,
          score2: null,
          winnerId: t2.id,
          status: "complete",
        });
      } else {
        matches.push({
          matchId,
          team1Id: t1?.id ?? null,
          team1Name: t1?.teamName ?? null,
          score1: null,
          team2Id: t2?.id ?? null,
          team2Name: t2?.teamName ?? null,
          score2: null,
          winnerId: null,
          status: "pending",
        });
      }
    }

    rounds.push({ roundNumber, matches });

    // Build next round's slots from winners (null for unplayed matches)
    currentSlots = matches.map((m) => {
      if (m.winnerId) {
        return (
          seeded.find((t) => t.id === m.winnerId) ?? {
            id: m.winnerId,
            teamName: m.team1Id === m.winnerId ? m.team1Name! : m.team2Name!,
            theme: "",
            players: [],
            createdAt: null as never,
          }
        );
      }
      return null;
    });

    roundNumber++;
  }

  return rounds;
}

/** Returns a label for a round number given total rounds */
export function getRoundLabel(roundNumber: number, totalRounds: number): string {
  const fromEnd = totalRounds - roundNumber;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${roundNumber}`;
}
