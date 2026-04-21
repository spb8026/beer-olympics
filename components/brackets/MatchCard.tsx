import type { Match } from "@/types";
import { Crown } from "lucide-react";
import Image from "next/image";

interface Props {
  match: Match;
  teamPhotos?: Record<string, string>;
}

export default function MatchCard({ match, teamPhotos }: Props) {
  const { team1Name, team2Name, score1, score2, winnerId, team1Id, team2Id, status } = match;

  function slotStyle(isWinner: boolean, isEmpty: boolean) {
    if (isEmpty) return { color: "rgba(255,255,255,0.2)", fontStyle: "italic" as const };
    if (isWinner) return { color: "#fbbf24", fontWeight: 800 };
    if (status === "complete") return { color: "rgba(255,255,255,0.25)", textDecoration: "line-through" as const };
    return { color: "#e2e8f0", fontWeight: 600 };
  }

  const borderColor = status === "active" ? "#fbbf24" : "rgba(255,255,255,0.08)";
  const winnerBg = "rgba(251,191,36,0.08)";

  const photo1 = team1Id && teamPhotos?.[team1Id];
  const photo2 = team2Id && teamPhotos?.[team2Id];

  return (
    <div
      className="rounded-xl text-sm overflow-hidden"
      style={{
        border: `1px solid ${borderColor}`,
        boxShadow: status === "active" ? "0 0 12px rgba(251,191,36,0.15)" : "none",
      }}
    >
      {/* Team 1 */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{
          background: winnerId === team1Id ? winnerBg : "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          {photo1 ? (
            <Image
              src={photo1}
              alt={team1Name ?? "Team 1"}
              width={22}
              height={22}
              className="rounded-md object-cover shrink-0"
            />
          ) : null}
          {winnerId === team1Id && <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
          <span style={slotStyle(winnerId === team1Id, !team1Name)}>
            {team1Name || "TBD"}
          </span>
        </div>
        {score1 !== null && (
          <span className="font-black tabular-nums" style={{ color: winnerId === team1Id ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
            {score1}
          </span>
        )}
      </div>

      {/* Team 2 */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ background: winnerId === team2Id ? winnerBg : "rgba(255,255,255,0.03)" }}
      >
        <div className="flex items-center gap-2">
          {photo2 ? (
            <Image
              src={photo2}
              alt={team2Name ?? "Team 2"}
              width={22}
              height={22}
              className="rounded-md object-cover shrink-0"
            />
          ) : null}
          {winnerId === team2Id && <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
          <span style={slotStyle(winnerId === team2Id, !team2Name)}>
            {team2Name === "BYE" ? "BYE" : team2Name || "TBD"}
          </span>
        </div>
        {score2 !== null && (
          <span className="font-black tabular-nums" style={{ color: winnerId === team2Id ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
            {score2}
          </span>
        )}
      </div>
    </div>
  );
}
