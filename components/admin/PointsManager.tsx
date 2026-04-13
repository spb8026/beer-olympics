"use client";

import { useState, useEffect } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useScores } from "@/hooks/useScores";
import { usePlayerScores } from "@/hooks/usePlayerScores";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Medal, Save, Users, User } from "lucide-react";

// ─── Team Points tab ───────────────────────────────────────────────────────

function TeamPointsTab() {
  const { teams, loading: teamsLoading } = useTeams();
  const { games, loading: gamesLoading } = useGames();
  const { scores, loading: scoresLoading } = useScores();
  const [draft, setDraft] = useState<Record<string, { games: Record<string, number>; bonus: number }>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Team games: team-bracket and round-robin
  const teamGames = games.filter((g) => g.gameType === "team-bracket" || g.gameType === "round-robin");

  useEffect(() => {
    if (teams.length === 0) return;
    const init: typeof draft = {};
    for (const team of teams) {
      const existing = scores.find((s) => s.teamId === team.id);
      init[team.id] = { games: existing?.games ?? {}, bonus: existing?.bonus ?? 0 };
    }
    setDraft(init);
  }, [teams, scores]);

  function setPoints(teamId: string, gameId: string, value: number) {
    setDraft((prev) => ({
      ...prev,
      [teamId]: { ...prev[teamId], games: { ...prev[teamId]?.games, [gameId]: value } },
    }));
  }

  function setBonus(teamId: string, value: number) {
    setDraft((prev) => ({ ...prev, [teamId]: { ...prev[teamId], bonus: value } }));
  }

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      teams.map((team) =>
        fetch("/api/admin/scores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: team.id,
            teamName: team.teamName,
            games: draft[team.id]?.games ?? {},
            bonus: draft[team.id]?.bonus ?? 0,
          }),
        })
      )
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (teamsLoading || gamesLoading || scoresLoading) return <LoadingSpinner />;
  if (teams.length === 0) return <p className="text-slate-600 text-sm">No teams registered yet.</p>;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-xl px-4 py-2 transition"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : saving ? "Saving..." : "Save Team Points"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 pr-4 min-w-[140px]">Team</th>
              {teamGames.map((g) => (
                <th key={g.id} className="text-center text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]">
                  {g.name}
                </th>
              ))}
              <th className="text-center text-amber-600 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]">Bonus</th>
              <th className="text-center text-yellow-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const d = draft[team.id] ?? { games: {}, bonus: 0 };
              const total = Object.values(d.games).reduce((a, b) => a + (b || 0), 0) + (d.bonus || 0);
              return (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/2 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200">{team.teamName}</td>
                  {teamGames.map((g) => (
                    <td key={g.id} className="py-3 px-2 text-center">
                      <input
                        type="number" min={0}
                        value={d.games[g.id] ?? ""}
                        onChange={(e) => setPoints(team.id, g.id, e.target.value === "" ? 0 : Number(e.target.value))}
                        className="w-16 bg-white/5 border border-white/10 text-slate-100 text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                      />
                    </td>
                  ))}
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number" min={0}
                      value={d.bonus ?? ""}
                      onChange={(e) => setBonus(team.id, e.target.value === "" ? 0 : Number(e.target.value))}
                      className="w-16 bg-white/5 border border-amber-700/40 text-slate-100 text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                    />
                  </td>
                  <td className="py-3 px-2 text-center font-black text-yellow-400 text-base">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {teamGames.length === 0 && (
        <p className="text-slate-600 text-sm mt-2">No team-bracket or round-robin games configured yet. Set game types in the Games tab.</p>
      )}
    </div>
  );
}

// ─── Player Points tab ─────────────────────────────────────────────────────

function PlayerPointsTab() {
  const { teams, loading: teamsLoading } = useTeams();
  const { games, loading: gamesLoading } = useGames();
  const { playerScores, loading: scoresLoading } = usePlayerScores();

  // player-game type games only
  const playerGames = games.filter((g) => g.gameType === "player-game");

  // Build flat list of all players: { playerId, playerName, teamId, teamName }
  const allPlayers = teams.flatMap((team) =>
    team.players
      .map((name, i) => ({ playerId: `${team.id}::${i}`, playerName: name?.trim() ?? "", teamId: team.id, teamName: team.teamName }))
      .filter((p) => p.playerName)
  );

  const [draft, setDraft] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (allPlayers.length === 0) return;
    const init: typeof draft = {};
    for (const p of allPlayers) {
      const existing = playerScores.find((s) => s.playerId === p.playerId);
      init[p.playerId] = existing?.games ?? {};
    }
    setDraft(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, playerScores]);

  function setPoints(playerId: string, gameId: string, value: number) {
    setDraft((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [gameId]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      allPlayers.map((p) =>
        fetch("/api/admin/player-scores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: p.playerId,
            playerName: p.playerName,
            teamId: p.teamId,
            teamName: p.teamName,
            games: draft[p.playerId] ?? {},
          }),
        })
      )
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (teamsLoading || gamesLoading || scoresLoading) return <LoadingSpinner />;
  if (allPlayers.length === 0) return <p className="text-slate-600 text-sm">No players registered yet.</p>;

  // Group players by team for display
  const byTeam = teams.map((team) => ({
    team,
    players: allPlayers.filter((p) => p.teamId === team.id),
  })).filter((g) => g.players.length > 0);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-xl px-4 py-2 transition"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : saving ? "Saving..." : "Save Player Points"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 pr-2 min-w-[120px]">Player</th>
              <th className="text-left text-slate-600 font-bold uppercase tracking-wide text-xs pb-3 pr-4 min-w-[100px]">Team</th>
              {playerGames.map((g) => (
                <th key={g.id} className="text-center text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]">
                  {g.name}
                </th>
              ))}
              <th className="text-center text-yellow-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[60px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {byTeam.map(({ team, players }) => (
              <>
                {/* Team separator row */}
                <tr key={`sep-${team.id}`}>
                  <td colSpan={3 + playerGames.length} className="pt-3 pb-1 text-xs font-black uppercase tracking-widest text-slate-600">
                    {team.teamName}
                  </td>
                </tr>
                {players.map((p) => {
                  const d = draft[p.playerId] ?? {};
                  const total = Object.values(d).reduce((a, b) => a + (b || 0), 0);
                  return (
                    <tr key={p.playerId} className="border-b border-white/5 hover:bg-white/2 transition">
                      <td className="py-2 pr-2 font-semibold text-slate-300">{p.playerName}</td>
                      <td className="py-2 pr-4 text-slate-600 text-xs">{team.teamName}</td>
                      {playerGames.map((g) => (
                        <td key={g.id} className="py-2 px-2 text-center">
                          <input
                            type="number" min={0}
                            value={d[g.id] ?? ""}
                            onChange={(e) => setPoints(p.playerId, g.id, e.target.value === "" ? 0 : Number(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 text-slate-100 text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                          />
                        </td>
                      ))}
                      <td className="py-2 px-2 text-center font-black text-yellow-400">{total}</td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {playerGames.length === 0 && (
        <p className="text-slate-600 text-sm mt-2">No player-game type games configured yet. Set game types in the Games tab.</p>
      )}
    </div>
  );
}

// ─── Root component ────────────────────────────────────────────────────────

export default function PointsManager() {
  const [tab, setTab] = useState<"team" | "player">("team");

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
          <Medal className="w-5 h-5" /> Points Assignment
        </h2>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => setTab("team")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition"
            style={tab === "team" ? { background: "#fbbf24", color: "#0f172a" } : { background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
          >
            <Users className="w-3.5 h-3.5" /> Team Points
          </button>
          <button
            onClick={() => setTab("player")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition"
            style={tab === "player" ? { background: "#fbbf24", color: "#0f172a" } : { background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
          >
            <User className="w-3.5 h-3.5" /> Player Points
          </button>
        </div>
      </div>

      {tab === "team" ? <TeamPointsTab /> : <PlayerPointsTab />}
    </div>
  );
}
