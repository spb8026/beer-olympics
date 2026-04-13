"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed, Plus, Trash2, ChevronDown } from "lucide-react";
import type { PotluckCategory, PotluckSignup } from "@/types";

const CATEGORIES: { label: PotluckCategory; color: string; bg: string }[] = [
  { label: "Appetizer",  color: "#F4C300", bg: "rgba(244,195,0,0.12)"    },
  { label: "Main Dish",  color: "#DF0024", bg: "rgba(223,0,36,0.12)"     },
  { label: "Side",       color: "#009F6B", bg: "rgba(0,159,107,0.12)"    },
  { label: "Dessert",    color: "#e879f9", bg: "rgba(232,121,249,0.12)"  },
  { label: "Drinks",     color: "#0085C7", bg: "rgba(0,133,199,0.12)"    },
  { label: "Other",      color: "#94a3b8", bg: "rgba(148,163,184,0.12)"  },
];

function categoryStyle(cat: string) {
  return CATEGORIES.find((c) => c.label === cat) ?? CATEGORIES[5];
}

export default function PotluckSection() {
  const [signups, setSignups] = useState<PotluckSignup[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<PotluckCategory>("Other");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // optimistic delete tracking
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchSignups() {
    try {
      const res = await fetch("/api/potluck");
      if (res.ok) setSignups(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSignups(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !item.trim()) {
      setError("Please fill in your name and what you're bringing.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/potluck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, item, category }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setName("");
      setItem("");
      setCategory("Other");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      fetchSignups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/potluck", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setSignups((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // group signups by category for display
  const grouped = CATEGORIES.map(({ label }) => ({
    label,
    items: signups.filter((s) => s.category === label),
  })).filter((g) => g.items.length > 0);

  return (
    <section
      className="relative"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div
              className="rounded-2xl p-3"
              style={{ background: "rgba(0,159,107,0.15)", border: "1px solid rgba(0,159,107,0.3)" }}
            >
              <UtensilsCrossed className="w-8 h-8" style={{ color: "#009F6B" }} />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Potluck Sign-Up
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            This is a potluck event — everyone chips in on the food. Sign up below so we
            don't end up with eight bags of chips and nothing else. Pick a category that
            still has room and bring enough for a crowd.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Sign-up form */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h3 className="text-lg font-black text-white mb-5">Sign Up to Bring Something</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-400">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={60}
                  className="rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    // @ts-expect-error ring color via CSS var workaround
                    "--tw-ring-color": "rgba(0,159,107,0.5)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-400">What Are You Bringing?</label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g. Pulled pork sliders"
                  maxLength={80}
                  className="rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    // @ts-expect-error ring color via CSS var workaround
                    "--tw-ring-color": "rgba(0,159,107,0.5)",
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-400">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PotluckCategory)}
                    className="w-full appearance-none rounded-xl px-4 py-3 text-white outline-none focus:ring-2 pr-10"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      // @ts-expect-error ring color via CSS var workaround
                      "--tw-ring-color": "rgba(0,159,107,0.5)",
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.label} value={c.label} style={{ background: "#0d1b2a" }}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {error && (
                <p className="text-sm font-semibold" style={{ color: "#DF0024" }}>{error}</p>
              )}

              {success && (
                <p className="text-sm font-semibold" style={{ color: "#009F6B" }}>
                  You&apos;re signed up! Thanks for contributing.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-black text-slate-900 transition disabled:opacity-50"
                style={{
                  background: submitting ? "#94a3b8" : "#009F6B",
                  boxShadow: submitting ? "none" : "0 0 20px rgba(0,159,107,0.3)",
                }}
              >
                <Plus className="w-5 h-5" />
                {submitting ? "Signing Up…" : "Sign Me Up"}
              </button>
            </form>
          </div>

          {/* What people are bringing */}
          <div>
            <h3 className="text-lg font-black text-white mb-5">
              What People Are Bringing
              {signups.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-400">
                  ({signups.length} item{signups.length !== 1 ? "s" : ""})
                </span>
              )}
            </h3>

            {loading && (
              <div className="text-slate-500 text-sm">Loading…</div>
            )}

            {!loading && signups.length === 0 && (
              <div
                className="rounded-2xl p-6 text-center text-slate-400 text-sm"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
              >
                Nobody has signed up yet — be the first!
              </div>
            )}

            {!loading && grouped.length > 0 && (
              <div className="flex flex-col gap-5">
                {grouped.map(({ label, items }) => {
                  const style = categoryStyle(label);
                  return (
                    <div key={label}>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-black uppercase tracking-widest rounded-full px-3 py-1"
                          style={{ color: style.color, background: style.bg }}
                        >
                          {label}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {items.map((signup) => (
                          <div
                            key={signup.id}
                            className="flex items-center justify-between rounded-xl px-4 py-3 group"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                          >
                            <div>
                              <span className="text-white font-bold text-sm">{signup.item}</span>
                              <span className="text-slate-500 text-xs ml-2">by {signup.name}</span>
                            </div>
                            <button
                              onClick={() => handleDelete(signup.id)}
                              disabled={deletingId === signup.id}
                              title="Remove"
                              className="opacity-0 group-hover:opacity-100 transition rounded-lg p-1 hover:bg-red-500/20 disabled:opacity-30"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
