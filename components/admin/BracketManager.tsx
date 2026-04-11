"use client";

import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useBracket } from "@/hooks/useBracket";
import { useGames } from "@/hooks/useGames";
import { generateBracket, getRoundLabel } from "@/lib/bracketUtils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Shuffle, Save, Trophy } from "lucide-react";
import type { Round, Match } from "@/types";

function ScoreInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      className="w-14 bg-white/4 border border-white/10 text-slate-100 text-center rounded px-2 py-1 text-sm focus:outline-none focus:border-yellow-400"
    />
  );
}

function MatchEditor({
  match,
  onChange,
}: {
  match: Match;
  onChange: (m: Match) => void;
}) {
  function setWinner(id: string | null) {
    onChange({
      ...match,
      winnerId: id,
      status: id ? "complete" : match.score1 !== null || match.score2 !== null ? "active" : "pending",
    });
  }

  return (
    <div className="bg-amber-950/40 border border-white/10/60 rounded-xl p-3 text-sm">
      {/* Team 1 row */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="radio"
          name={`winner-${match.matchId}`}
          checked={match.winnerId === match.team1Id}
          onChange={() => match.team1Id && setWinner(match.team1Id)}
          disabled={!match.team1Id || match.team1Name === "BYE"}
          className="accent-amber-400"
        />
        <span className="flex-1 text-slate-300 truncate">
          {match.team1Name ?? "TBD"}
        </span>
        <ScoreInput
          value={match.score1}
          onChange={(v) => onChange({ ...match, score1: v })}
        />
      </div>

      {/* Team 2 row */}
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name={`winner-${match.matchId}`}
          checked={match.winnerId === match.team2Id}
          onChange={() => match.team2Id && setWinner(match.team2Id)}
          disabled={!match.team2Id || match.team2Name === "BYE"}
          className="accent-amber-400"
        />
        <span className="flex-1 text-slate-300 truncate">
          {match.team2Name ?? "TBD"}
        </span>
        <ScoreInput
          value={match.score2}
          onChange={(v) => onChange({ ...match, score2: v })}
        />
      </div>
    </div>
  );
}

function GameBracketEditor({ gameId, gameName }: { gameId: string; gameName: string }) {
  const { teams, loading: teamsLoading } = useTeams();
  const { bracket, loading: bracketLoading } = useBracket(gameId);
  const [localRounds, setLocalRounds] = useState<Round[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const rounds = localRounds ?? bracket?.rounds ?? null;

  async function handleGenerate() {
    if (teams.length < 2) {
      alert("Need at least 2 registered teams to generate a bracket.");
      return;
    }
    if (!confirm(`Generate a new random bracket for ${gameName}? This will overwrite any existing bracket.`))
      return;

    setGenerating(true);
    const newRounds = generateBracket(teams);
    setLocalRounds(newRounds);

    await fetch("/api/admin/brackets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, rounds: newRounds }),
    });
    setGenerating(false);
    setLocalRounds(null);
  }

  function updateMatch(roundIndex: number, matchIndex: number, updated: Match) {
    if (!rounds) return;

    const newRounds = rounds.map((round, ri) => {
      if (ri !== roundIndex) return round;
      const newMatches = round.matches.map((m, mi) =>
        mi === matchIndex ? updated : m
      );

      // Propagate winner to next round
      if (updated.winnerId && ri + 1 < rounds.length) {
        const nextRound = rounds[ri + 1];
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isTeam1Slot = matchIndex % 2 === 0;
        const nextMatch = nextRound.matches[nextMatchIndex];
        if (nextMatch) {
          const winnerName =
            updated.winnerId === updated.team1Id
              ? updated.team1Name
              : updated.team2Name;
          const updatedNextMatch: Match = {
            ...nextMatch,
            ...(isTeam1Slot
              ? { team1Id: updated.winnerId, team1Name: winnerName }
              : { team2Id: updated.winnerId, team2Name: winnerName }),
            status: nextMatch.status === "pending" ? "pending" : nextMatch.status,
          };
          const updatedNextMatches = nextRound.matches.map((m, nmi) =>
            nmi === nextMatchIndex ? updatedNextMatch : m
          );
          // We need to also update the next round
          return {
            ...round,
            matches: newMatches,
          };
          // Note: propagation to next round is handled below
        }
      }

      return { ...round, matches: newMatches };
    });

    // Handle next-round propagation separately
    if (updated.winnerId && roundIndex + 1 < newRounds.length) {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isTeam1Slot = matchIndex % 2 === 0;
      const nextRound = newRounds[roundIndex + 1];
      const nextMatch = nextRound?.matches[nextMatchIndex];
      if (nextMatch) {
        const winnerName =
          updated.winnerId === updated.team1Id
            ? updated.team1Name
            : updated.team2Name;
        newRounds[roundIndex + 1] = {
          ...nextRound,
          matches: nextRound.matches.map((m, nmi) =>
            nmi === nextMatchIndex
              ? {
                  ...m,
                  ...(isTeam1Slot
                    ? { team1Id: updated.winnerId, team1Name: winnerName }
                    : { team2Id: updated.winnerId, team2Name: winnerName }),
                }
              : m
          ),
        };
      }
    }

    setLocalRounds(newRounds);
  }

  async function handleSave() {
    if (!rounds) return;
    setSaving(true);
    await fetch("/api/admin/brackets", {
      method: bracket?.generated ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, rounds }),
    });
    setSaving(false);
    setLocalRounds(null);
  }

  if (teamsLoading || bracketLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-slate-100 font-bold text-sm rounded-xl px-4 py-2.5 transition"
        >
          <Shuffle className="w-4 h-4" />
          {generating ? "Generating..." : "Generate Random Bracket"}
        </button>

        {localRounds && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-black text-sm rounded-xl px-4 py-2.5 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save to Firestore"}
          </button>
        )}
      </div>

      {!rounds ? (
        <p className="text-slate-600 text-sm">No bracket yet. Generate one above.</p>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-6 items-start min-w-max">
            {rounds.map((round, ri) => (
              <div key={ri} className="flex flex-col gap-3 min-w-[200px]">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600 text-center pb-1 border-b border-white/10/40">
                  {getRoundLabel(round.roundNumber, rounds.length)}
                </div>
                {round.matches.map((match, mi) => (
                  <MatchEditor
                    key={match.matchId}
                    match={match}
                    onChange={(updated) => updateMatch(ri, mi, updated)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BracketManager() {
  const { games, loading } = useGames();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  const bracketGames = games.filter((g) => g.slug !== "bonus-points");
  const activeGame = bracketGames.find((g) => g.id === selectedGame) ?? bracketGames[0];

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Bracket Manager
      </h2>

      {/* Game selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {bracketGames.map((game) => {
          const isActive = (selectedGame ?? bracketGames[0]?.id) === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                isActive
                  ? "bg-yellow-400 text-slate-900"
                  : "bg-white/4 border border-white/10 text-yellow-400 hover:border-amber-600"
              }`}
            >
              {game.name}
            </button>
          );
        })}
      </div>

      {activeGame && (
        <GameBracketEditor gameId={activeGame.id} gameName={activeGame.name} />
      )}
    </div>
  );
}
