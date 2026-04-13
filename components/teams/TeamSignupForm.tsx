"use client";

import { useState } from "react";
import { Users } from "lucide-react";

export default function TeamSignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [teamName, setTeamName] = useState("");
  const [theme, setTheme] = useState("");
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function setPlayer(index: number, value: string) {
    setPlayers((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filledPlayers = players.filter((p) => p.trim());
    if (filledPlayers.length < 2) {
      setError("Please enter at least 2 player names.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: teamName.trim(), theme: theme.trim(), players: filledPlayers }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: "rgba(0,159,107,0.1)", border: "1px solid rgba(0,159,107,0.3)" }}
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-black text-green-400 mb-1">Team registered!</h3>
        <p className="text-slate-400 text-sm mb-3">
          <strong className="text-white">{teamName}</strong> is on the list. See you on game day!
        </p>
        <p className="text-yellow-400 text-sm font-bold">
          $8 entry fee per team, Venmo Shawn or Pay @ Door
        </p>
      </div>
    );
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-black text-white">Register a Team</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Team Name *</label>
          <input
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. The Sip Happens"
            className="rounded-lg px-4 py-3 focus:outline-none transition placeholder-slate-600"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Theme / Costume *</label>
          <input
            required
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. Superheroes, 80s, Hawaiian"
            className="rounded-lg px-4 py-3 focus:outline-none transition placeholder-slate-600"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Players (up to 4)</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {players.map((p, i) => (
            <input
              key={i}
              value={p}
              onChange={(e) => setPlayer(i, e.target.value)}
              placeholder={`Player ${i + 1}${i < 2 ? " *" : " (optional)"}`}
              className="rounded-lg px-4 py-3 focus:outline-none transition placeholder-slate-600"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
      >
        <span className="font-black text-yellow-400">$8</span>
        <span className="text-slate-400"> entry fee per team, Venmo Shawn or Pay @ Door</span>
      </div>

      <button
        type="submit"
        disabled={loading || !teamName.trim() || !theme.trim()}
        className="font-black text-base rounded-xl py-3.5 transition disabled:opacity-40 disabled:cursor-not-allowed text-slate-900"
        style={{ background: "#fbbf24", boxShadow: "0 0 20px rgba(251,191,36,0.2)" }}
      >
        {loading ? "Registering..." : "Register Team"}
      </button>
    </form>
  );
}
