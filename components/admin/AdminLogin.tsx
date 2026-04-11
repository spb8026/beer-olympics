"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      onSuccess();
    } else {
      setError("Wrong password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#040a1a" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="rounded-full p-4"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Access</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="rounded-xl px-5 py-4 focus:outline-none transition placeholder-slate-600"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "2px solid rgba(255,255,255,0.1)",
              color: "#f1f5f9",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="font-black text-lg rounded-xl py-4 transition disabled:opacity-40 text-slate-900"
            style={{ background: "#fbbf24" }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
