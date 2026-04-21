import type { Round } from "@/types";
import MatchCard from "./MatchCard";

interface Props {
  round: Round;
  label: string;
  teamPhotos?: Record<string, string>;
}

export default function RoundColumn({ round, label, teamPhotos }: Props) {
  return (
    <div className="flex flex-col gap-3 min-w-[160px] w-48">
      <div
        className="text-xs font-bold uppercase tracking-widest text-center pb-1"
        style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {label}
      </div>
      <div
        className="flex flex-col justify-around gap-4 flex-1"
        style={{ minHeight: `${round.matches.length * 80}px` }}
      >
        {round.matches.map((match) => (
          <MatchCard key={match.matchId} match={match} teamPhotos={teamPhotos} />
        ))}
      </div>
    </div>
  );
}
