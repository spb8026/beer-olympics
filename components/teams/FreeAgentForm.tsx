"use client";

import { useState } from "react";
import { addFreeAgent } from "@/lib/firestore/freeAgents";
import { UserPlus } from "lucide-react";

export default function FreeAgentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addFreeAgent(name.trim());
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
        style={{ background: "rgba(0,133,199,0.1)", border: "1px solid rgba(0,133,199,0.3)" }}
      >
        <div className="text-4xl mb-3">✋</div>
        <h3 className="text-xl font-black text-blue-400 mb-1">You&apos;re on the list!</h3>
        <p className="text-slate-400 text-sm">
          <strong className="text-white">{name}</strong> has been added as a free agent. A team will pick you up!
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
        <UserPlus className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-black text-white">Join as a Free Agent</h3>
      </div>
      <p className="text-slate-500 text-sm -mt-3">
        No team yet? Sign up solo and get assigned to a team that needs a player.
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your Name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First & last name"
          className="rounded-lg px-4 py-3 focus:outline-none transition placeholder-slate-600"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#0085c7")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="font-black text-base rounded-xl py-3.5 transition disabled:opacity-40 disabled:cursor-not-allowed text-white"
        style={{ background: "#0085C7" }}
      >
        {loading ? "Signing up..." : "Sign Up as Free Agent"}
      </button>
    </form>
  );
}
