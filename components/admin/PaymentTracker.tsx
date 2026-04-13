"use client";

import { useEffect, useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckCircle2, Circle, DollarSign } from "lucide-react";

export default function PaymentTracker() {
  const { teams, loading: teamsLoading } = useTeams();
  // teamId -> paid
  const [paid, setPaid] = useState<Record<string, boolean>>({});
  const [loadingPaid, setLoadingPaid] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => setPaid(data))
      .finally(() => setLoadingPaid(false));
  }, []);

  async function toggle(teamId: string) {
    const next = !paid[teamId];
    setToggling(teamId);
    setPaid((prev) => ({ ...prev, [teamId]: next }));
    try {
      await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, paid: next }),
      });
    } catch {
      // revert on failure
      setPaid((prev) => ({ ...prev, [teamId]: !next }));
    } finally {
      setToggling(null);
    }
  }

  if (teamsLoading || loadingPaid) return <LoadingSpinner />;

  const paidCount = teams.filter((t) => paid[t.id]).length;
  const total = teams.length;
  const collected = paidCount * 5;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-yellow-400">
          Payment Tracker
        </h2>
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1.5"
            style={{ background: "rgba(0,159,107,0.15)", border: "1px solid rgba(0,159,107,0.3)", color: "#34d399" }}
          >
            <DollarSign className="w-4 h-4" />
            ${collected} collected
          </div>
          <div
            className="rounded-xl px-4 py-2 text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
          >
            {paidCount} / {total} paid
          </div>
        </div>
      </div>

      {teams.length === 0 ? (
        <p className="text-slate-600">No teams registered yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {teams.map((team) => {
            const isPaid = !!paid[team.id];
            const isToggling = toggling === team.id;
            return (
              <button
                key={team.id}
                onClick={() => toggle(team.id)}
                disabled={isToggling}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition disabled:opacity-60"
                style={{
                  background: isPaid
                    ? "rgba(0,159,107,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: isPaid
                    ? "1px solid rgba(0,159,107,0.3)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#34d399" }} />
                  ) : (
                    <Circle className="w-5 h-5 shrink-0 text-slate-600" />
                  )}
                  <div>
                    <span className={`font-bold text-sm ${isPaid ? "text-green-300" : "text-slate-300"}`}>
                      {team.teamName}
                    </span>
                    <span className="text-xs text-slate-600 ml-2">Theme: {team.theme}</span>
                  </div>
                </div>
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={
                    isPaid
                      ? { background: "rgba(0,159,107,0.2)", color: "#34d399" }
                      : { background: "rgba(255,255,255,0.06)", color: "#64748b" }
                  }
                >
                  {isPaid ? "PAID $8" : "UNPAID"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {teams.length > 0 && (
        <p className="text-xs text-slate-600 mt-4">
          Click a team to toggle their payment status.
        </p>
      )}
    </div>
  );
}
