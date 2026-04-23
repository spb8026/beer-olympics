"use client";

import { useBracket } from "@/hooks/useBracket";
import RoundColumn from "./RoundColumn";
import { getRoundLabel, computeStandings } from "@/lib/bracketUtils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Trophy, Crown } from "lucide-react";
import type { Game, Round, PlayerGame, TeamPair } from "@/types";
import MatchCard from "./MatchCard";

// ─── Round-robin public view ───────────────────────────────────────────────

function RoundRobinView({ rounds, teamPhotos }: { rounds: Round[] | undefined; teamPhotos?: Record<string, string> }) {
  const standings = computeStandings(rounds ?? []);

  return (
    <div className="flex flex-col gap-8">
      {standings.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Standings</h3>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div
              className="grid text-xs font-bold uppercase text-slate-600 px-4 py-2"
              style={{ gridTemplateColumns: "auto 1fr 56px 56px 56px 56px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-6 text-center">#</div>
              <div className="pl-2">Team</div>
              <div className="text-center">W</div>
              <div className="text-center">L</div>
              <div className="text-center">PF</div>
              <div className="text-center">PA</div>
            </div>
            {standings.map((row, i) => (
              <div
                key={row.id}
                className="grid px-4 py-2.5 text-sm"
                style={{
                  gridTemplateColumns: "auto 1fr 56px 56px 56px 56px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  color: i === 0 ? "#fbbf24" : "#cbd5e1",
                }}
              >
                <div className="w-6 text-center font-black" style={{ color: i === 0 ? "#fbbf24" : "rgba(255,255,255,0.2)" }}>
                  {i + 1}
                </div>
                <div className="font-bold pl-2">{row.name}</div>
                <div className="text-center font-bold" style={{ color: "#4ade80" }}>{row.wins}</div>
                <div className="text-center" style={{ color: "#f87171" }}>{row.losses}</div>
                <div className="text-center text-slate-500">{row.pointsFor}</div>
                <div className="text-center text-slate-500">{row.pointsAgainst}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Schedule</h3>
        <div className="flex flex-col gap-6">
          {(rounds ?? []).map((round) => (
            <div key={round.roundNumber}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                Round {round.roundNumber}
              </div>
              <div className="flex flex-col gap-2">
                {round.matches.map((match) => (
                  <div key={match.matchId} className="max-w-xs">
                    <MatchCard match={match} teamPhotos={teamPhotos} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Paired round-robin view (baseball) ───────────────────────────────────

function PairedTeamSlot({
  pairId,
  pairings,
  score,
  isWinner,
  isComplete,
}: {
  pairId: string | null;
  pairings: TeamPair[];
  score: number | null;
  isWinner: boolean;
  isComplete: boolean;
}) {
  const pair = pairings.find((p) => p.pairId === pairId);
  const names = pair ? pair.teamNames : [pairId ?? "TBD", ""];

  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{
        background: isWinner ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        {names.filter(Boolean).map((name, i) => (
          <span
            key={i}
            className="text-sm leading-tight truncate"
            style={
              isWinner
                ? { color: "#fbbf24", fontWeight: 700 }
                : isComplete
                ? { color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }
                : { color: "#e2e8f0", fontWeight: 600 }
            }
          >
            {i === 0 && isWinner && <Crown className="w-3 h-3 text-yellow-400 inline mr-1 shrink-0" />}
            {name}
          </span>
        ))}
      </div>
      {score !== null && (
        <span
          className="font-black tabular-nums text-sm ml-3 shrink-0"
          style={{ color: isWinner ? "#fbbf24" : "rgba(255,255,255,0.3)" }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function PairedRoundRobinView({ rounds, pairings }: { rounds: Round[] | undefined; pairings: TeamPair[] }) {
  const standings = computeStandings(rounds ?? []);

  // Build a display-friendly name for standings (pair name)
  function pairDisplayName(id: string) {
    return pairings.find((p) => p.pairId === id)?.pairName ?? id;
  }

  return (
    <div className="flex flex-col gap-8">
      {standings.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Standings</h3>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div
              className="grid text-xs font-bold uppercase text-slate-600 px-4 py-2"
              style={{ gridTemplateColumns: "auto 1fr 56px 56px 56px 56px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-6 text-center">#</div>
              <div className="pl-2">Pair</div>
              <div className="text-center">W</div>
              <div className="text-center">L</div>
              <div className="text-center">PF</div>
              <div className="text-center">PA</div>
            </div>
            {standings.map((row, i) => (
              <div
                key={row.id}
                className="px-4 py-2.5"
                style={{
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="grid items-start text-sm"
                  style={{ gridTemplateColumns: "auto 1fr 56px 56px 56px 56px", color: i === 0 ? "#fbbf24" : "#cbd5e1" }}
                >
                  <div className="w-6 text-center font-black" style={{ color: i === 0 ? "#fbbf24" : "rgba(255,255,255,0.2)" }}>
                    {i + 1}
                  </div>
                  <div className="pl-2 flex flex-col gap-0.5">
                    {(pairings.find((p) => p.pairId === row.id)?.teamNames ?? [row.name]).map((name, ni) => (
                      <span key={ni} className="font-bold leading-tight">{name}</span>
                    ))}
                  </div>
                  <div className="text-center font-bold self-center" style={{ color: "#4ade80" }}>{row.wins}</div>
                  <div className="text-center self-center" style={{ color: "#f87171" }}>{row.losses}</div>
                  <div className="text-center text-slate-500 self-center">{row.pointsFor}</div>
                  <div className="text-center text-slate-500 self-center">{row.pointsAgainst}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Schedule</h3>
        <div className="flex flex-col gap-6">
          {(rounds ?? []).map((round) => (
            <div key={round.roundNumber}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                Round {round.roundNumber}
              </div>
              <div className="flex flex-col gap-2">
                {round.matches.map((match) => (
                  <div
                    key={match.matchId}
                    className="rounded-xl overflow-hidden max-w-xs text-sm"
                    style={{
                      border: match.status === "active" ? "1px solid #fbbf24" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: match.status === "active" ? "0 0 12px rgba(251,191,36,0.15)" : "none",
                    }}
                  >
                    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <PairedTeamSlot
                        pairId={match.team1Id}
                        pairings={pairings}
                        score={match.score1}
                        isWinner={match.winnerId === match.team1Id}
                        isComplete={match.status === "complete"}
                      />
                    </div>
                    <PairedTeamSlot
                      pairId={match.team2Id}
                      pairings={pairings}
                      score={match.score2}
                      isWinner={match.winnerId === match.team2Id}
                      isComplete={match.status === "complete"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Player-games public view ──────────────────────────────────────────────

function PlayerGamesView({ playerGames }: { playerGames: PlayerGame[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {playerGames.map((game, i) => {
        const winner = game.participants.find((p) => p.id === game.winnerId);
        const statusBorder =
          game.status === "complete"
            ? "rgba(74,222,128,0.3)"
            : game.status === "active"
            ? "rgba(251,191,36,0.3)"
            : "rgba(255,255,255,0.08)";

        return (
          <div
            key={game.gameId}
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${statusBorder}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Game {i + 1}
              </span>
              {game.status === "complete" && winner && (
                <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                  <Crown className="w-3 h-3" /> Won
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {game.participants.map((p) => {
                const isWinner = game.winnerId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                    style={
                      isWinner
                        ? { background: "rgba(251,191,36,0.12)", color: "#fbbf24", fontWeight: 700 }
                        : game.status === "complete"
                        ? { color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }
                        : { color: "#cbd5e1" }
                    }
                  >
                    {isWinner && <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                    {p.name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────

export default function BracketView({ game, teamPhotos }: { game: Game; teamPhotos?: Record<string, string> }) {
  const { bracket, loading } = useBracket(game.id);
  const gameType = game.gameType ?? "team-bracket";

  if (loading) return <LoadingSpinner />;

  if (gameType === "none") {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">This game uses points only — no bracket or schedule.</p>
      </div>
    );
  }

  if (!bracket?.generated) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="font-semibold text-slate-500">
          {gameType === "round-robin"
            ? "Schedule not generated yet"
            : gameType === "paired-round-robin"
            ? "Paired schedule not generated yet"
            : gameType === "player-game"
            ? "Player groups not generated yet"
            : "Bracket not generated yet"}
        </p>
        <p className="text-sm mt-1 text-slate-600">Check back on game day.</p>
      </div>
    );
  }

  if (gameType === "paired-round-robin") {
    return <PairedRoundRobinView rounds={bracket.rounds} pairings={bracket.pairings ?? []} />;
  }

  if (gameType === "round-robin") {
    return <RoundRobinView rounds={bracket.rounds} teamPhotos={teamPhotos} />;
  }

  if (gameType === "player-game") {
    if (!bracket.playerGames?.length) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-600">No player groups generated yet.</p>
        </div>
      );
    }
    return <PlayerGamesView playerGames={bracket.playerGames} />;
  }

  // team-bracket — elimination tree
  const totalRounds = bracket.rounds.length;
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 items-start min-w-max px-1">
        {bracket.rounds.map((round) => (
          <RoundColumn
            key={round.roundNumber}
            round={round}
            label={getRoundLabel(round.roundNumber, totalRounds)}
            teamPhotos={teamPhotos}
          />
        ))}
      </div>
    </div>
  );
}
