"use client";

import { useState } from "react";
import ConfigEditor from "@/components/admin/ConfigEditor";
import TeamManager from "@/components/admin/TeamManager";
import FreeAgentManager from "@/components/admin/FreeAgentManager";
import GameEditor from "@/components/admin/GameEditor";
import BracketManager from "@/components/admin/BracketManager";
import InviteManager from "@/components/admin/InviteManager";
import PointsManager from "@/components/admin/PointsManager";
import { Settings, Users, UserPlus, Gamepad2, Trophy, UserCheck, Medal } from "lucide-react";

type Tab = "config" | "teams" | "freeagents" | "games" | "brackets" | "invites" | "points";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "config", label: "Config", icon: Settings },
  { id: "teams", label: "Teams", icon: Users },
  { id: "freeagents", label: "Free Agents", icon: UserPlus },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "brackets", label: "Brackets", icon: Trophy },
  { id: "invites", label: "Invites", icon: UserCheck },
  { id: "points", label: "Points", icon: Medal },
];

const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("config");

  return (
    <div className="min-h-screen" style={{ background: "#040a1a" }}>
      <header
        className="px-4 py-4"
        style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-yellow-400">Admin Panel</h1>
          <span className="text-xs text-slate-600">Beer Olympics</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-8 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition"
              style={
                tab === id
                  ? { background: "#fbbf24", color: "#0f172a" }
                  : { color: "#94a3b8", ...card }
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div>
          {tab === "config" && <ConfigEditor />}
          {tab === "teams" && <TeamManager />}
          {tab === "freeagents" && <FreeAgentManager />}
          {tab === "games" && <GameEditor />}
          {tab === "brackets" && <BracketManager />}
          {tab === "invites" && <InviteManager />}
          {tab === "points" && <PointsManager />}
        </div>
      </div>
    </div>
  );
}
