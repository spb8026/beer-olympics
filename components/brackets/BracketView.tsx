"use client";

import { useBracket } from "@/hooks/useBracket";
import RoundColumn from "./RoundColumn";
import { getRoundLabel } from "@/lib/bracketUtils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Trophy } from "lucide-react";
import type { Game } from "@/types";

export default function BracketView({ game }: { game: Game }) {
  const { bracket, loading } = useBracket(game.id);

  if (loading) return <LoadingSpinner />;

  if (!bracket || !bracket.generated) {
    return (
      <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold text-slate-500">Bracket not generated yet</p>
        <p className="text-sm mt-1 text-slate-600">Check back on game day.</p>
      </div>
    );
  }

  const totalRounds = bracket.rounds.length;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 items-start min-w-max px-1">
        {bracket.rounds.map((round) => (
          <RoundColumn
            key={round.roundNumber}
            round={round}
            label={getRoundLabel(round.roundNumber, totalRounds)}
          />
        ))}
      </div>
    </div>
  );
}
