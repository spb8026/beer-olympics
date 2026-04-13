"use client";

import { useState } from "react";
import { useGames } from "@/hooks/useGames";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Pencil, Save, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Game, GameType } from "@/types";

const GAME_TYPE_OPTIONS: { value: GameType; label: string; description: string }[] = [
  { value: "team-bracket", label: "Team Bracket",  description: "Single elimination — teams vs teams" },
  { value: "player-game",  label: "Player Games",  description: "Players randomly grouped into games of a set size" },
  { value: "round-robin",  label: "Round Robin",   description: "Everyone plays everyone, ranked by wins" },
  { value: "none",         label: "No Schedule",   description: "Points only, no bracket or schedule" },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Edit existing game ────────────────────────────────────────────────────────
function EditForm({ game, onDone }: { game: Game; onDone: () => void }) {
  const [description, setDescription] = useState(game.description);
  const [rules, setRules] = useState<string[]>(game.rules);
  const [gameType, setGameType] = useState<GameType>(game.gameType ?? "team-bracket");
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
      body: JSON.stringify({ id: game.id, description, rules: rules.filter((r) => r.trim()), gameType }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-xl p-4 flex flex-col gap-4 mt-2">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Schedule Type</label>
        <div className="grid sm:grid-cols-2 gap-2">
          {GAME_TYPE_OPTIONS.map((opt) => {
            const active = gameType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGameType(opt.value)}
                className="text-left rounded-lg px-3 py-2.5 border transition"
                style={
                  active
                    ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.5)", color: "#fbbf24" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }
                }
              >
                <div className="font-bold text-sm">{opt.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{opt.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Description</label>
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
              <button onClick={() => removeRule(i)} className="text-red-500 hover:text-red-400 p-1">
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

// ── Add new game form ─────────────────────────────────────────────────────────
function AddGameForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<string[]>([""]);
  const [gameType, setGameType] = useState<GameType>("team-bracket");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(val: string) {
    setName(val);
    if (!slugTouched) setSlug(slugify(val));
  }

  function updateRule(i: number, val: string) {
    setRules((prev) => prev.map((r, idx) => (idx === i ? val : r)));
  }

  function removeRule(i: number) {
    setRules((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setError("");
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        rules: rules.filter((r) => r.trim()),
        gameType,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed to create game.");
      return;
    }
    onDone();
  }

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}
    >
      <h3 className="text-sm font-black text-yellow-400 uppercase tracking-wide">New Game</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Name *</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Beer Pong"
            className="bg-white/4 border border-white/10 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Slug *</label>
          <input
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
            placeholder="e.g. beer-pong"
            className="bg-white/4 border border-white/10 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Schedule Type</label>
        <div className="grid sm:grid-cols-2 gap-2">
          {GAME_TYPE_OPTIONS.map((opt) => {
            const active = gameType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGameType(opt.value)}
                className="text-left rounded-lg px-3 py-2.5 border transition"
                style={
                  active
                    ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.5)", color: "#fbbf24" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }
                }
              >
                <div className="font-bold text-sm">{opt.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{opt.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Brief description of the game…"
          className="w-full bg-white/4 border border-white/10 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none placeholder-slate-600"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rules</label>
          <button
            type="button"
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
                placeholder={`Rule ${i + 1}`}
                className="flex-1 bg-white/4 border border-white/10 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 placeholder-slate-600"
              />
              <button onClick={() => removeRule(i)} className="text-red-500 hover:text-red-400 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-900 font-bold text-sm rounded-lg px-4 py-2 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? "Creating..." : "Create Game"}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function GameEditor() {
  const { games, loading } = useGames();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteGame(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch("/api/admin/games", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-yellow-400">
          Games ({games.length})
        </h2>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditing(null); }}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold text-sm rounded-lg px-3 py-2 transition"
          >
            <Plus className="w-4 h-4" /> Add Game
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <AddGameForm onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {games.map((game) => {
          const typeLabel = GAME_TYPE_OPTIONS.find((o) => o.value === (game.gameType ?? "team-bracket"))?.label ?? "Team Bracket";
          const isDeleting = deleting === game.id;
          return (
            <div key={game.id} className="bg-white/4 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-slate-200">{game.name}</span>
                  <span className="ml-2 text-xs text-slate-600 font-medium">{typeLabel}</span>
                  <span className="ml-2 text-xs text-slate-700 font-mono">{game.slug}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editing !== game.id && (
                    <button
                      onClick={() => { setEditing(game.id); setAdding(false); }}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-yellow-400 border border-white/10 rounded-lg px-3 py-1.5 transition"
                    >
                      {editing === game.id ? <ChevronUp className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteGame(game.id, game.name)}
                    disabled={isDeleting}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 border border-red-900/40 rounded-lg px-3 py-1.5 transition disabled:opacity-40 hover:bg-red-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isDeleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>

              {editing === game.id ? (
                <EditForm game={game} onDone={() => setEditing(null)} />
              ) : (
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{game.description}</p>
              )}
            </div>
          );
        })}

        {games.length === 0 && !adding && (
          <p className="text-slate-600 text-sm">No games yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
