"use client";

import { useTeams } from "@/hooks/useTeams";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Trash2, Shield } from "lucide-react";

export default function TeamManager() {
  const { teams, loading } = useTeams();

  async function deleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Delete team "${teamName}"?`)) return;
    await fetch("/api/admin/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-4">
        Teams ({teams.length})
      </h2>
      {teams.length === 0 ? (
        <p className="text-slate-600">No teams yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white/4 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-black text-slate-200">{team.teamName}</div>
                <div className="text-xs text-slate-600 mb-2">
                  Theme: {team.theme}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.players.map((p, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-white/5 text-yellow-400 text-xs rounded px-2 py-0.5"
                    >
                      <Shield className="w-3 h-3" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deleteTeam(team.id, team.teamName)}
                className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
