"use client";

import TeamSignupForm from "@/components/teams/TeamSignupForm";
import FreeAgentForm from "@/components/teams/FreeAgentForm";
import { useTeams } from "@/hooks/useTeams";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Users } from "lucide-react";

export default function TeamsPage() {
  const { teams, loading } = useTeams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-yellow-400 mb-2">Teams</h1>
        <p className="text-slate-400">
          Register your squad or sign up solo — we&apos;ll find you a home.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <TeamSignupForm />
        <FreeAgentForm />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-black text-white">
          Registered Teams
          <span className="ml-2 text-slate-500 font-normal text-base">({teams.length})</span>
        </h2>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : teams.length === 0 ? (
        <div className="text-center py-12 text-slate-600">No teams registered yet. Be the first!</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {teams.map((team, i) => {
            const colors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B"];
            const color = colors[i % colors.length];
            return (
              <div
                key={team.id}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-black text-white text-lg leading-tight">{team.teamName}</h3>
                  <span
                    className="shrink-0 text-xs rounded-full px-2 py-0.5 font-semibold"
                    style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                  >
                    {team.theme}
                  </span>
                </div>
                {team.players.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {team.players.map((player, pi) => (
                      <span
                        key={pi}
                        className="text-xs rounded-lg px-2.5 py-1 text-slate-300"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
