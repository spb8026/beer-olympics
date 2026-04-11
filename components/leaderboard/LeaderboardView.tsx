"use client";

import { useScores } from "@/hooks/useScores";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Trophy, Medal } from "lucide-react";

const medalColors = ["#F4C300", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze
const ringColors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B", "#EE334E"];

function MedalIcon({ rank }: { rank: number }) {
  if (rank > 3) return <span className="text-slate-600 font-black text-sm w-6 text-center">{rank}</span>;
  return (
    <Medal
      className="w-5 h-5 flex-shrink-0"
      style={{ color: medalColors[rank - 1] }}
    />
  );
}

export default function LeaderboardView() {
  const { scores, loading: scoresLoading } = useScores();
  const { teams, loading: teamsLoading } = useTeams();
  const { games, loading: gamesLoading } = useGames();

  const scorableGames = games.filter((g) => g.slug !== "bonus-points");

  // Build ranked list: all teams, merge with score data, sort by total desc
  const ranked = teams
    .map((team) => {
      const score = scores.find((s) => s.teamId === team.id);
      const gamePoints = score?.games ?? {};
      const bonus = score?.bonus ?? 0;
      const total = Object.values(gamePoints).reduce((a, b) => a + (b || 0), 0) + bonus;
      return { team, gamePoints, bonus, total };
    })
    .sort((a, b) => b.total - a.total);

  const hasAnyPoints = ranked.some((r) => r.total > 0);

  if (scoresLoading || teamsLoading || gamesLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center gap-3 mb-4">
          {ringColors.map((c) => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <h1 className="text-4xl font-black text-yellow-400 mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          Leaderboard
        </h1>
        <p className="text-slate-500 text-sm">Live standings — updates in real-time</p>
      </div>

      {teams.length === 0 ? (
        <p className="text-center text-slate-600">No teams registered yet.</p>
      ) : !hasAnyPoints ? (
        <p className="text-center text-slate-600">Points will appear here once games are scored.</p>
      ) : (
        <>
          {/* Top 3 podium cards */}
          {ranked.length >= 1 && (
            <div className="flex gap-4 justify-center mb-8 flex-wrap">
              {ranked.slice(0, Math.min(3, ranked.length)).map((entry, i) => {
                const color = medalColors[i];
                return (
                  <div
                    key={entry.team.id}
                    className="flex-1 min-w-[160px] max-w-[220px] rounded-2xl p-5 text-center"
                    style={{
                      background: `rgba(255,255,255,0.04)`,
                      border: `2px solid ${color}40`,
                      boxShadow: i === 0 ? `0 0 24px ${color}30` : undefined,
                    }}
                  >
                    <div className="text-3xl font-black mb-1" style={{ color }}>
                      #{i + 1}
                    </div>
                    <div className="font-black text-slate-100 text-sm mb-0.5">{entry.team.teamName}</div>
                    <div className="text-xs text-slate-500 mb-3">{entry.team.theme}</div>
                    <div className="text-3xl font-black" style={{ color }}>
                      {entry.total}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">points</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full standings table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Column headers */}
            <div
              className="grid text-xs font-bold uppercase tracking-wide text-slate-500 px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                gridTemplateColumns: `auto 1fr repeat(${scorableGames.length + 2}, minmax(60px, 1fr))`,
              }}
            >
              <div className="w-8 text-center">#</div>
              <div>Team</div>
              {scorableGames.map((g) => (
                <div key={g.id} className="text-center truncate px-1">{g.name}</div>
              ))}
              <div className="text-center text-amber-600">Bonus</div>
              <div className="text-center text-yellow-400">Total</div>
            </div>

            {ranked.map((entry, i) => {
              const rank = i + 1;
              const color = rank <= 3 ? medalColors[rank - 1] : undefined;
              return (
                <div
                  key={entry.team.id}
                  className="grid items-center px-4 py-3 transition"
                  style={{
                    gridTemplateColumns: `auto 1fr repeat(${scorableGames.length + 2}, minmax(60px, 1fr))`,
                    background: rank === 1 ? "rgba(251,191,36,0.05)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="w-8 flex justify-center">
                    <MedalIcon rank={rank} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm" style={color ? { color } : undefined}>
                      {entry.team.teamName}
                    </div>
                    <div className="text-xs text-slate-600">{entry.team.theme}</div>
                  </div>
                  {scorableGames.map((g) => (
                    <div key={g.id} className="text-center text-slate-400 text-sm">
                      {entry.gamePoints[g.id] ?? 0}
                    </div>
                  ))}
                  <div className="text-center text-amber-500 text-sm font-semibold">
                    {entry.bonus}
                  </div>
                  <div className="text-center font-black text-base" style={{ color: color ?? "#fbbf24" }}>
                    {entry.total}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
