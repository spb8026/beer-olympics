"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function OlympicRings() {
  const rings = [
    { color: "#0085C7", cx: 16 },
    { color: "#F4C300", cx: 44 },
    { color: "#000000", cx: 72 },
    { color: "#009F6B", cx: 100 },
    { color: "#DF0024", cx: 128 },
  ];
  return (
    <svg viewBox="0 0 148 40" className="w-36 h-10 opacity-90">
      {rings.map(({ color, cx }) => (
        <circle
          key={cx}
          cx={cx}
          cy={20}
          r={16}
          fill="none"
          stroke={color}
          strokeWidth={3.5}
        />
      ))}
    </svg>
  );
}

export default function CodeGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push("/home");
    } else {
      setError("Wrong code — check with your host.");
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #040a1a 0%, #080f2a 50%, #040a1a 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center gap-5 mb-10">
          <OlympicRings />
          <div className="text-center">
            <h1 className="text-4xl font-black text-yellow-400 tracking-tight">
              Beer Olympics
            </h1>
            <p className="text-slate-400 text-sm mt-1">Enter your access code to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ACCESS CODE"
            className="w-full rounded-xl px-5 py-4 text-center text-xl font-bold tracking-widest uppercase focus:outline-none transition"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "2px solid rgba(255,255,255,0.12)",
              color: "#f1f5f9",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
            autoFocus
            autoComplete="off"
          />
          {error && (
            <p className="text-red-400 text-center text-sm font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-black text-lg rounded-xl py-4 transition shadow-lg"
            style={{ boxShadow: "0 0 24px rgba(251,191,36,0.25)" }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
