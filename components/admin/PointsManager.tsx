"use client";

import { useState, useEffect } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useScores } from "@/hooks/useScores";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Medal, Save } from "lucide-react";
import type { TeamScore } from "@/types";

export default function PointsManager() {
  const { teams, loading: teamsLoading } = useTeams();
  const { games, loading: gamesLoading } = useGames();
  const { scores, loading: scoresLoading } = useScores();

  // local draft: teamId -> { games: Record<gameId, number>, bonus: number }
  const [draft, setDraft] = useState<Record<string, { games: Record<string, number>; bonus: number }>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize draft from Firestore scores
  useEffect(() => {
    if (teams.length === 0) return;
    const init: typeof draft = {};
    for (const team of teams) {
      const existing = scores.find((s) => s.teamId === team.id);
      init[team.id] = {
        games: existing?.games ?? {},
        bonus: existing?.bonus ?? 0,
      };
    }
    setDraft(init);
  }, [teams, scores]);

  function setPoints(teamId: string, gameId: string, value: number) {
    setDraft((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        games: { ...prev[teamId]?.games, [gameId]: value },
      },
    }));
  }

  function setBonus(teamId: string, value: number) {
    setDraft((prev) => ({
      ...prev,
      [teamId]: { ...prev[teamId], bonus: value },
    }));
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

  const scorableGames = games.filter((g) => g.slug !== "bonus-points");

  if (teamsLoading || gamesLoading || scoresLoading) return <LoadingSpinner />;
  if (teams.length === 0) return <p className="text-slate-600 text-sm">No teams registered yet.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
          <Medal className="w-5 h-5" /> Points Assignment
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-xl px-4 py-2.5 transition"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : saving ? "Saving..." : "Save All Points"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 pr-4 min-w-[140px]">
                Team
              </th>
              {scorableGames.map((g) => (
                <th
                  key={g.id}
                  className="text-center text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]"
                >
                  {g.name}
                </th>
              ))}
              <th className="text-center text-slate-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]">
                Bonus
              </th>
              <th className="text-center text-yellow-500 font-bold uppercase tracking-wide text-xs pb-3 px-2 min-w-[80px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const teamDraft = draft[team.id] ?? { games: {}, bonus: 0 };
              const gameTotal = Object.values(teamDraft.games).reduce((a, b) => a + (b || 0), 0);
              const total = gameTotal + (teamDraft.bonus || 0);

              return (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/2 transition">
                  <td className="py-3 pr-4 font-bold text-slate-200">{team.teamName}</td>
                  {scorableGames.map((g) => (
                    <td key={g.id} className="py-3 px-2 text-center">
                      <input
                        type="number"
                        min={0}
                        value={teamDraft.games[g.id] ?? ""}
                        onChange={(e) =>
                          setPoints(team.id, g.id, e.target.value === "" ? 0 : Number(e.target.value))
                        }
                        className="w-16 bg-white/5 border border-white/10 text-slate-100 text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                      />
                    </td>
                  ))}
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      value={teamDraft.bonus ?? ""}
                      onChange={(e) =>
                        setBonus(team.id, e.target.value === "" ? 0 : Number(e.target.value))
                      }
                      className="w-16 bg-white/5 border border-amber-700/40 text-slate-100 text-center rounded-lg px-2 py-1.5 focus:outline-none focus:border-yellow-400"
                    />
                  </td>
                  <td className="py-3 px-2 text-center font-black text-yellow-400 text-base">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
