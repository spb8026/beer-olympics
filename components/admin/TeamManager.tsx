"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTeams } from "@/hooks/useTeams";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Trash2, Shield } from "lucide-react";
import type { Team } from "@/types";

interface SelectedPlayer {
  teamId: string;
  playerIndex: number;
  name: string;
}

async function patchTeamPlayers(teamId: string, players: string[]) {
  await fetch("/api/admin/teams", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, players }),
  });
}

export default function TeamManager() {
  const { teams, loading } = useTeams();
  const [localTeams, setLocalTeams] = useState<Team[]>([]);
  const [teamSize, setTeamSize] = useState<2 | 4>(2);
  const [selected, setSelected] = useState<SelectedPlayer | null>(null);

  useEffect(() => { setLocalTeams(teams); }, [teams]);

  useEffect(() => {
    return onSnapshot(doc(db, "config", "site"), (snap) => {
      const size = snap.data()?.teamSize;
      if (size === 2 || size === 4) setTeamSize(size);
    });
  }, []);

  async function deleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Delete team "${teamName}"?`)) return;
    await fetch("/api/admin/teams", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
  }

  function applyAndSave(newTeams: Team[], changedIds: string[]) {
    setLocalTeams(newTeams);
    setSelected(null);
    for (const id of changedIds) {
      const t = newTeams.find((t) => t.id === id);
      if (t) patchTeamPlayers(id, t.players);
    }
  }

  function handlePlayerClick(teamId: string, playerIndex: number, name: string) {
    if (!selected) {
      setSelected({ teamId, playerIndex, name });
      return;
    }
    if (selected.teamId === teamId && selected.playerIndex === playerIndex) {
      setSelected(null);
      return;
    }
    // Swap selected player with clicked player
    const newTeams = localTeams.map((t) => ({ ...t, players: [...t.players] }));
    const src = newTeams.find((t) => t.id === selected.teamId)!;
    const dst = newTeams.find((t) => t.id === teamId)!;
    src.players[selected.playerIndex] = name;
    dst.players[playerIndex] = selected.name;
    const changed = selected.teamId === teamId ? [teamId] : [selected.teamId, teamId];
    applyAndSave(newTeams, changed);
  }

  function handleEmptySlotClick(teamId: string) {
    if (!selected || selected.teamId === teamId) return;
    const newTeams = localTeams.map((t) => ({ ...t, players: [...t.players] }));
    const src = newTeams.find((t) => t.id === selected.teamId)!;
    const dst = newTeams.find((t) => t.id === teamId)!;
    src.players.splice(selected.playerIndex, 1);
    dst.players.push(selected.name);
    applyAndSave(newTeams, [selected.teamId, teamId]);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-black text-yellow-400">
          Teams ({localTeams.length})
          <span className="ml-2 text-sm font-semibold text-slate-500">· {teamSize}v{teamSize}</span>
        </h2>
        {selected ? (
          <div className="flex items-center gap-3">
            <span
              className="text-sm text-yellow-300 rounded-lg px-3 py-1.5"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}
            >
              Moving <span className="font-bold">{selected.name}</span> — click a player to swap or an empty slot to move
            </span>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-slate-500 hover:text-slate-400 underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-600">Click any player to start moving them</p>
        )}
      </div>

      {localTeams.length === 0 ? (
        <p className="text-slate-600">No teams yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {localTeams.map((team) => {
            const canReceive = selected && selected.teamId !== team.id && team.players.length < teamSize;
            return (
              <div
                key={team.id}
                className="rounded-xl p-4 transition"
                style={{
                  background: canReceive ? "rgba(251,191,36,0.05)" : "rgba(255,255,255,0.04)",
                  border: canReceive ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-black text-slate-200">{team.teamName}</div>
                    <div className="text-xs text-slate-600">Theme: {team.theme}</div>
                  </div>
                  <button
                    onClick={() => deleteTeam(team.id, team.teamName)}
                    className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Slots up to teamSize */}
                  {Array.from({ length: teamSize }).map((_, slotIndex) => {
                    const playerName = team.players[slotIndex] ?? null;

                    if (playerName === null) {
                      return (
                        <button
                          key={`slot-${slotIndex}`}
                          onClick={() => handleEmptySlotClick(team.id)}
                          disabled={!selected || selected.teamId === team.id}
                          className="rounded-lg px-3 py-2 text-xs text-left transition"
                          style={{
                            border: selected && selected.teamId !== team.id
                              ? "2px dashed rgba(251,191,36,0.5)"
                              : "2px dashed rgba(255,255,255,0.08)",
                            color: selected && selected.teamId !== team.id ? "rgba(251,191,36,0.6)" : "#334155",
                            cursor: selected && selected.teamId !== team.id ? "pointer" : "default",
                          }}
                        >
                          empty slot
                        </button>
                      );
                    }

                    const isSelected = selected?.teamId === team.id && selected?.playerIndex === slotIndex;
                    return (
                      <button
                        key={`player-${slotIndex}`}
                        onClick={() => handlePlayerClick(team.id, slotIndex, playerName)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-left transition cursor-pointer"
                        style={
                          isSelected
                            ? { background: "#fbbf24", color: "#0f172a", outline: "2px solid #fde68a" }
                            : selected
                            ? { background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }
                            : { background: "rgba(255,255,255,0.05)", color: "#fbbf24" }
                        }
                      >
                        <Shield className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{playerName}</span>
                      </button>
                    );
                  })}

                  {/* Extra players beyond teamSize */}
                  {team.players.slice(teamSize).map((playerName, i) => {
                    const idx = teamSize + i;
                    const isSelected = selected?.teamId === team.id && selected?.playerIndex === idx;
                    return (
                      <button
                        key={`extra-${i}`}
                        onClick={() => handlePlayerClick(team.id, idx, playerName)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-left transition cursor-pointer"
                        style={
                          isSelected
                            ? { background: "#fbbf24", color: "#0f172a", outline: "2px solid #fde68a" }
                            : {
                                background: "rgba(239,68,68,0.1)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.3)",
                              }
                        }
                      >
                        <Shield className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{playerName}</span>
                        <span className="ml-auto font-black text-[10px]">!</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
