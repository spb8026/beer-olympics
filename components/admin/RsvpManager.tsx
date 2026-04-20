"use client";

import { useEffect, useState } from "react";
import { UserCheck, Trash2, RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Rsvp } from "@/types";

export default function RsvpManager() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchRsvps() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rsvps");
      if (res.ok) setRsvps(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRsvps(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this RSVP?")) return;
    setDeletingId(id);
    try {
      await fetch("/api/admin/rsvps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setRsvps((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
          <UserCheck className="w-5 h-5" /> RSVPs
        </h2>
        <button
          onClick={fetchRsvps}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {rsvps.length} {rsvps.length === 1 ? "person" : "people"} have RSVP&apos;d
      </p>

      {rsvps.length === 0 ? (
        <p className="text-slate-600 text-sm">No RSVPs yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rsvps.map((rsvp, i) => (
            <div
              key={rsvp.id}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-slate-600 text-xs font-bold w-5 text-right shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm font-semibold text-slate-200">
                {rsvp.firstName} {rsvp.lastName}
              </span>
              <button
                onClick={() => handleDelete(rsvp.id)}
                disabled={deletingId === rsvp.id}
                className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-950/50 transition disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
