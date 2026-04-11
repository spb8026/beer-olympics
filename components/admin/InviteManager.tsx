"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invite } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { UserCheck, Trash2, Plus } from "lucide-react";

export default function InviteManager() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "invites"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invite)));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function addInvite() {
    if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    setAdding(false);
  }

  async function toggleComing(invite: Invite) {
    await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: invite.id, coming: !invite.coming }),
    });
  }

  async function deleteInvite(id: string) {
    if (!confirm("Remove this invite?")) return;
    await fetch("/api/admin/invites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: id }),
    });
  }

  const coming = invites.filter((i) => i.coming).length;
  const total = invites.length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-1 flex items-center gap-2">
        <UserCheck className="w-5 h-5" /> Invite Tracker
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        {coming} coming / {total} invited
      </p>

      {/* Add invite */}
      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addInvite()}
          placeholder="Person's name..."
          className="flex-1 bg-white/5 border border-white/10 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={addInvite}
          disabled={adding || !newName.trim()}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-xl px-4 py-2.5 transition"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {invites.length === 0 ? (
        <p className="text-slate-600 text-sm">No invites yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition ${
                invite.coming
                  ? "bg-green-950/40 border-green-700/40"
                  : "bg-white/4 border-white/10"
              }`}
            >
              <input
                type="checkbox"
                checked={invite.coming}
                onChange={() => toggleComing(invite)}
                className="w-4 h-4 accent-green-500 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm font-semibold ${
                  invite.coming ? "text-green-400" : "text-slate-300"
                }`}
              >
                {invite.name}
              </span>
              {invite.coming && (
                <span className="text-xs text-green-600 font-bold uppercase tracking-wide">Coming</span>
              )}
              <button
                onClick={() => deleteInvite(invite.id)}
                className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-950/50 transition"
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
