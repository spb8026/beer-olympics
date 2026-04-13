"use client";

import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useBracket } from "@/hooks/useBracket";
import { useGames } from "@/hooks/useGames";
import {
  generateBracket,
  generatePlayerGames,
  generateRoundRobin,
  getRoundLabel,
  computeStandings,
} from "@/lib/bracketUtils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Shuffle, Save, Trophy, Users } from "lucide-react";
import type { Round, Match, PlayerGame, GameType } from "@/types";

// ─── Shared score input ────────────────────────────────────────────────────

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

// ─── 1v1 match editor (used for team-bracket and round-robin) ──────────────

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
      status:
        id
          ? "complete"
          : match.score1 !== null || match.score2 !== null
          ? "active"
          : "pending",
    });
  }

  return (
    <div className="bg-amber-950/40 border border-white/10 rounded-xl p-3 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="radio"
          name={`winner-${match.matchId}`}
          checked={match.winnerId === match.team1Id}
          onChange={() => match.team1Id && setWinner(match.team1Id)}
          disabled={!match.team1Id || match.team1Name === "BYE"}
          className="accent-amber-400"
        />
        <span className="flex-1 text-slate-300 truncate">{match.team1Name ?? "TBD"}</span>
        <ScoreInput value={match.score1} onChange={(v) => onChange({ ...match, score1: v })} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name={`winner-${match.matchId}`}
          checked={match.winnerId === match.team2Id}
          onChange={() => match.team2Id && setWinner(match.team2Id)}
          disabled={!match.team2Id || match.team2Name === "BYE"}
          className="accent-amber-400"
        />
        <span className="flex-1 text-slate-300 truncate">{match.team2Name ?? "TBD"}</span>
        <ScoreInput value={match.score2} onChange={(v) => onChange({ ...match, score2: v })} />
      </div>
    </div>
  );
}

// ─── Elimination bracket view (columns) ────────────────────────────────────

function BracketEditor({
  rounds,
  onUpdateMatch,
}: {
  rounds: Round[];
  onUpdateMatch: (ri: number, mi: number, updated: Match) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-6 items-start min-w-max">
        {rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col gap-3 min-w-[200px]">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 text-center pb-1 border-b border-white/10">
              {getRoundLabel(round.roundNumber, rounds.length)}
            </div>
            {round.matches.map((match, mi) => (
              <MatchEditor
                key={match.matchId}
                match={match}
                onChange={(updated) => onUpdateMatch(ri, mi, updated)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Round-robin view (list + standings) ───────────────────────────────────

function RoundRobinEditor({
  rounds,
  onUpdateMatch,
}: {
  rounds: Round[];
  onUpdateMatch: (ri: number, mi: number, updated: Match) => void;
}) {
  const standings = computeStandings(rounds);

  return (
    <div className="flex flex-col gap-6">
      {standings.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Standings</div>
          <div className="rounded-xl overflow-hidden border border-white/8">
            <div
              className="grid text-xs font-bold uppercase text-slate-600 px-3 py-2 bg-white/3"
              style={{ gridTemplateColumns: "1fr 60px 60px 60px 60px" }}
            >
              <div>Team</div>
              <div className="text-center">W</div>
              <div className="text-center">L</div>
              <div className="text-center">PF</div>
              <div className="text-center">PA</div>
            </div>
            {standings.map((row, i) => (
              <div
                key={row.id}
                className="grid px-3 py-2 text-sm border-t border-white/5"
                style={{
                  gridTemplateColumns: "1fr 60px 60px 60px 60px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                }}
              >
                <div className="font-semibold text-slate-300">{row.name}</div>
                <div className="text-center text-green-400 font-bold">{row.wins}</div>
                <div className="text-center text-red-400">{row.losses}</div>
                <div className="text-center text-slate-400">{row.pointsFor}</div>
                <div className="text-center text-slate-400">{row.pointsAgainst}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rounds.map((round, ri) => (
        <div key={ri}>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Round {round.roundNumber}
          </div>
          <div className="flex flex-col gap-2">
            {round.matches.map((match, mi) => (
              <MatchEditor
                key={match.matchId}
                match={match}
                onChange={(updated) => onUpdateMatch(ri, mi, updated)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Player-game card ──────────────────────────────────────────────────────

function PlayerGameCard({
  game,
  index,
  onChange,
}: {
  game: PlayerGame;
  index: number;
  onChange: (g: PlayerGame) => void;
}) {
  function setWinner(id: string) {
    onChange({
      ...game,
      winnerId: id,
      status: "complete",
    });
  }

  function clearWinner() {
    onChange({ ...game, winnerId: null, status: "pending" });
  }

  const statusColor =
    game.status === "complete"
      ? "border-green-700/50"
      : game.status === "active"
      ? "border-yellow-500/50"
      : "border-white/10";

  return (
    <div className={`rounded-xl border p-4 ${statusColor} bg-white/3`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Game {index + 1}
        </span>
        {game.winnerId && (
          <button
            onClick={clearWinner}
            className="text-xs text-slate-600 hover:text-red-400 transition"
          >
            Clear winner
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {game.participants.map((p) => {
          const isWinner = game.winnerId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => (isWinner ? clearWinner() : setWinner(p.id))}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition w-full"
              style={
                isWinner
                  ? { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24", fontWeight: 700 }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#94a3b8" }
              }
            >
              <span
                className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-xs"
                style={
                  isWinner
                    ? { background: "#fbbf24", border: "none", color: "#0f172a" }
                    : { border: "1px solid rgba(255,255,255,0.2)" }
                }
              >
                {isWinner && "✓"}
              </span>
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Player-games editor ───────────────────────────────────────────────────

function PlayerGamesEditor({
  playerGames,
  onUpdateGame,
}: {
  playerGames: PlayerGame[];
  onUpdateGame: (index: number, updated: PlayerGame) => void;
}) {
  const completed = playerGames.filter((g) => g.status === "complete").length;

  return (
    <div>
      <div className="text-xs text-slate-500 mb-4">
        {completed} / {playerGames.length} games complete — click a player to mark them as winner
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {playerGames.map((game, i) => (
          <PlayerGameCard
            key={game.gameId}
            game={game}
            index={i}
            onChange={(updated) => onUpdateGame(i, updated)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Per-game bracket editor ───────────────────────────────────────────────

function GameBracketEditor({
  gameId,
  gameName,
  gameType,
}: {
  gameId: string;
  gameName: string;
  gameType: GameType;
}) {
  const { teams, loading: teamsLoading } = useTeams();
  const { bracket, loading: bracketLoading } = useBracket(gameId);

  const [localRounds, setLocalRounds] = useState<Round[] | null>(null);
  const [localPlayerGames, setLocalPlayerGames] = useState<PlayerGame[] | null>(null);
  const [gameSize, setGameSize] = useState(4);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const rounds = localRounds ?? bracket?.rounds ?? null;
  const playerGames = localPlayerGames ?? bracket?.playerGames ?? null;
  const hasLocalChanges = localRounds !== null || localPlayerGames !== null;

  async function handleGenerate() {
    if (gameType === "none") return;

    if (gameType === "player-game") {
      const totalPlayers = teams.flatMap((t) => t.players.filter((p) => p?.trim())).length;
      if (totalPlayers < 2) {
        alert("Need at least 2 players across all teams.");
        return;
      }
      if (!confirm(`Generate new player groups for ${gameName}? This will overwrite any existing schedule.`)) return;

      setGenerating(true);
      const newGames = generatePlayerGames(teams, gameSize);
      setLocalPlayerGames(newGames);

      await fetch("/api/admin/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerGames: newGames, gameSize }),
      });

      setGenerating(false);
      setLocalPlayerGames(null);
      return;
    }

    if (teams.length < 2) {
      alert("Need at least 2 registered teams.");
      return;
    }
    if (!confirm(`Generate a new schedule for ${gameName}? This will overwrite any existing bracket.`)) return;

    setGenerating(true);
    const newRounds =
      gameType === "team-bracket"
        ? generateBracket(teams)
        : generateRoundRobin(teams);
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

    let newRounds = rounds.map((round, ri) => {
      if (ri !== roundIndex) return round;
      return { ...round, matches: round.matches.map((m, mi) => (mi === matchIndex ? updated : m)) };
    });

    // Propagate winner through elimination bracket
    if (gameType === "team-bracket" && updated.winnerId && roundIndex + 1 < newRounds.length) {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isTeam1Slot = matchIndex % 2 === 0;
      const nextRound = newRounds[roundIndex + 1];
      const nextMatch = nextRound?.matches[nextMatchIndex];
      if (nextMatch) {
        const winnerName =
          updated.winnerId === updated.team1Id ? updated.team1Name : updated.team2Name;
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

  function updatePlayerGame(index: number, updated: PlayerGame) {
    const current = localPlayerGames ?? bracket?.playerGames ?? [];
    const newGames = current.map((g, i) => (i === index ? updated : g));
    setLocalPlayerGames(newGames);
  }

  async function handleSave() {
    setSaving(true);
    const method = bracket?.generated ? "PATCH" : "POST";

    if (gameType === "player-game" && localPlayerGames) {
      await fetch("/api/admin/brackets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerGames: localPlayerGames }),
      });
    } else if (rounds) {
      await fetch("/api/admin/brackets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, rounds }),
      });
    }

    setSaving(false);
    setLocalRounds(null);
    setLocalPlayerGames(null);
  }

  if (teamsLoading || bracketLoading) return <LoadingSpinner />;

  if (gameType === "none") {
    return (
      <p className="text-slate-600 text-sm">
        This game is set to &quot;No Schedule&quot; — change the type in the Games tab to generate a schedule.
      </p>
    );
  }

  const generateLabel =
    gameType === "round-robin"
      ? "Generate Round Robin"
      : gameType === "player-game"
      ? "Generate Player Groups"
      : "Generate Bracket";

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {gameType === "player-game" && (
          <div className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-xl px-3 py-2">
            <Users className="w-4 h-4 text-slate-500" />
            <label className="text-xs text-slate-400 font-semibold">Players per game</label>
            <input
              type="number"
              min={2}
              max={20}
              value={gameSize}
              onChange={(e) => setGameSize(Math.max(2, Number(e.target.value)))}
              className="w-12 bg-transparent text-slate-100 text-center text-sm focus:outline-none"
            />
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-slate-100 font-bold text-sm rounded-xl px-4 py-2.5 transition"
        >
          <Shuffle className="w-4 h-4" />
          {generating ? "Generating..." : generateLabel}
        </button>

        {hasLocalChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-black text-sm rounded-xl px-4 py-2.5 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* Content */}
      {gameType === "player-game" ? (
        playerGames && playerGames.length > 0 ? (
          <PlayerGamesEditor playerGames={playerGames} onUpdateGame={updatePlayerGame} />
        ) : (
          <p className="text-slate-600 text-sm">No groups yet. Set a size and generate above.</p>
        )
      ) : gameType === "round-robin" ? (
        rounds && rounds.length > 0 ? (
          <RoundRobinEditor rounds={rounds} onUpdateMatch={updateMatch} />
        ) : (
          <p className="text-slate-600 text-sm">No schedule yet. Generate one above.</p>
        )
      ) : rounds && rounds.length > 0 ? (
        <BracketEditor rounds={rounds} onUpdateMatch={updateMatch} />
      ) : (
        <p className="text-slate-600 text-sm">No bracket yet. Generate one above.</p>
      )}

      {/* Bottom save button for long scrolls */}
      {hasLocalChanges && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-black text-sm rounded-xl px-4 py-2.5 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Root component ────────────────────────────────────────────────────────

export default function BracketManager() {
  const { games, loading } = useGames();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  const managedGames = games.filter((g) => g.slug !== "bonus-points");
  const activeGame = managedGames.find((g) => g.id === selectedGame) ?? managedGames[0];

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Bracket Manager
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {managedGames.map((game) => {
          const isActive = (selectedGame ?? managedGames[0]?.id) === game.id;
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
        <GameBracketEditor
          gameId={activeGame.id}
          gameName={activeGame.name}
          gameType={activeGame.gameType ?? "team-bracket"}
        />
      )}
    </div>
  );
}
