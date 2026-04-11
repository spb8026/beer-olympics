"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTeams } from "@/hooks/useTeams";
import type { FreeAgent } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { UserPlus, Trash2 } from "lucide-react";

export default function FreeAgentManager() {
  const [agents, setAgents] = useState<FreeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const { teams } = useTeams();
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "freeAgents"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAgents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FreeAgent)));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function assign(agentId: string, teamId: string) {
    setAssigning(agentId);
    await fetch("/api/admin/free-agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, teamId }),
    });
    setAssigning(null);
  }

  async function deleteAgent(agentId: string) {
    if (!confirm("Remove this free agent?")) return;
    await fetch("/api/admin/free-agents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5" />
        Free Agents ({agents.filter((a) => !a.assignedTeamId).length} unassigned)
      </h2>
      {agents.length === 0 ? (
        <p className="text-slate-600">No free agents.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-white/4 border rounded-xl p-4 flex items-center justify-between gap-4 ${
                agent.assignedTeamId
                  ? "border-green-800/40 opacity-70"
                  : "border-white/10"
              }`}
            >
              <div>
                <div className="font-bold text-slate-300">{agent.name}</div>
                {agent.assignedTeamId && (
                  <div className="text-xs text-green-500 mt-0.5">
                    Assigned to:{" "}
                    {teams.find((t) => t.id === agent.assignedTeamId)?.teamName ??
                      "unknown"}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!agent.assignedTeamId && teams.length > 0 && (
                  <select
                    defaultValue=""
                    disabled={assigning === agent.id}
                    onChange={(e) => e.target.value && assign(agent.id, e.target.value)}
                    className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    <option value="">Assign to team...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => deleteAgent(agent.id)}
                  className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
