"use client";

import { useState } from "react";
import { useGames } from "@/hooks/useGames";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Pencil, Save, X, Plus, Trash2 } from "lucide-react";
import type { Game } from "@/types";

function EditForm({ game, onDone }: { game: Game; onDone: () => void }) {
  const [description, setDescription] = useState(game.description);
  const [rules, setRules] = useState<string[]>(game.rules);
  const [saving, setSaving] = useState(false);

  function updateRule(i: number, val: string) {
    setRules((prev) => prev.map((r, idx) => (idx === i ? val : r)));
  }

  function removeRule(i: number) {
    setRules((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/games", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: game.id, description, rules: rules.filter((r) => r.trim()) }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-4 flex flex-col gap-4 mt-2">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-white/4 border border-white/10 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rules</label>
          <button
            onClick={() => setRules((prev) => [...prev, ""])}
            className="flex items-center gap-1 text-xs text-yellow-400 hover:text-slate-200"
          >
            <Plus className="w-3.5 h-3.5" /> Add rule
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={rule}
                onChange={(e) => updateRule(i, e.target.value)}
                className="flex-1 bg-white/4 border border-white/10 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={() => removeRule(i)}
                className="text-red-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-lg px-4 py-2 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onDone}
          className="flex items-center gap-1.5 text-slate-500 hover:text-yellow-400 border border-white/10 text-sm rounded-lg px-4 py-2 transition"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function GameEditor() {
  const { games, loading } = useGames();
  const [editing, setEditing] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-4">Edit Games & Rules</h2>
      <div className="flex flex-col gap-4">
        {games.map((game) => (
          <div key={game.id} className="bg-white/4 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">{game.name}</span>
              {editing !== game.id && (
                <button
                  onClick={() => setEditing(game.id)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-yellow-400 border border-white/10 rounded-lg px-3 py-1.5 transition"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {editing === game.id ? (
              <EditForm game={game} onDone={() => setEditing(null)} />
            ) : (
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{game.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
