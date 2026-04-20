"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, MapPin, Beer, Trophy, Star, Shirt, UtensilsCrossed, UserCheck, Check } from "lucide-react";
import Link from "next/link";
import type { SiteConfig } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toJsDate(ts: unknown): Date | null {
  if (!ts) return null;
  try {
    if (typeof (ts as Timestamp).toDate === "function") return (ts as Timestamp).toDate();
    if (typeof ts === "object" && ts !== null && "seconds" in ts)
      return new Date((ts as { seconds: number }).seconds * 1000);
    if (typeof ts === "string") return new Date(ts);
  } catch {
    // fall through
  }
  return null;
}

function formatDate(ts: unknown): string {
  const d = toJsDate(ts);
  if (!d || isNaN(d.getTime())) return "April 25, 2026";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function OlympicRings({ className = "" }: { className?: string }) {
  const rings = [
    { color: "#0085C7", cx: 20 },
    { color: "#F4C300", cx: 54 },
    { color: "#1a1a1a", cx: 88 },
    { color: "#009F6B", cx: 122 },
    { color: "#DF0024", cx: 156 },
  ];
  return (
    <svg viewBox="0 0 176 46" className={className}>
      {rings.map(({ color, cx }) => (
        <circle key={cx} cx={cx} cy={23} r={19} fill="none" stroke={color} strokeWidth={4} />
      ))}
    </svg>
  );
}

export default function HeroSection() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  // RSVP form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) setConfig(snap.data() as SiteConfig);
    });
    return unsub;
  }, []);

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    setRsvpError("");
    if (!firstName.trim() || !lastName.trim()) {
      setRsvpError("Please enter your first and last name.");
      return;
    }
    setRsvpSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setFirstName("");
      setLastName("");
      setRsvpSuccess(true);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRsvpSubmitting(false);
    }
  }

  const eventName = config?.eventName ?? "Beer Olympics";
  const eventDate = formatDate(config?.eventDate ?? null);
  const location = config?.location ?? "Shawn's House";

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(0,133,199,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(223,0,36,0.1) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,159,107,0.08) 0%, transparent 50%), #040a1a",
        }}
      />

      {/* Hero content */}
      <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28">
        {/* Olympic rings */}
        <div className="flex justify-center mb-6">
          <OlympicRings className="w-44 h-auto opacity-85" />
        </div>

        {/* Title */}
        <h1 suppressHydrationWarning className="text-5xl sm:text-7xl font-black text-center text-yellow-400 leading-none tracking-tight mb-6 drop-shadow-lg">
          {eventName}
        </h1>

        {/* Date & Location */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-slate-200"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Calendar className="w-5 h-5 text-yellow-400 shrink-0" />
            <span suppressHydrationWarning className="font-bold">{eventDate}</span>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-slate-200"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <MapPin className="w-5 h-5 text-yellow-400 shrink-0" />
            <span suppressHydrationWarning className="font-bold">{location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-center text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Teams of 4 go head-to-head across a full night of drinking games and challenges,
          earning points with every win. At the end of the night, one team takes home
          the glory — and the bragging rights.

          *Games and Rules Subject to Change
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            href="/teams"
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-lg rounded-xl px-8 py-4 transition"
            style={{ boxShadow: "0 0 28px rgba(251,191,36,0.3)" }}
          >
            Register Your Team
          </Link>
          <Link
            href="/games"
            className="font-bold text-lg rounded-xl px-8 py-4 transition text-slate-200 hover:text-white"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            View Games & Rules
          </Link>
        </div>

        {/* RSVP */}
        <div className="max-w-lg mx-auto mb-16">
          {rsvpSuccess ? (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: "rgba(0,133,199,0.08)", border: "1px solid rgba(0,133,199,0.25)" }}
            >
              <div className="flex justify-center mb-3">
                <div className="rounded-full p-2.5" style={{ background: "rgba(0,133,199,0.2)" }}>
                  <Check className="w-6 h-6" style={{ color: "#0085C7" }} />
                </div>
              </div>
              <p className="text-white font-black text-lg mb-1">You&apos;re on the list!</p>
              <p className="text-slate-400 text-sm">See you there.</p>
              <button
                onClick={() => setRsvpSuccess(false)}
                className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-300 transition"
              >
                RSVP for someone else
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg p-1.5" style={{ background: "rgba(0,133,199,0.15)" }}>
                  <UserCheck className="w-4 h-4" style={{ color: "#0085C7" }} />
                </div>
                <h3 className="font-black text-white">RSVP</h3>
                <span className="text-slate-500 text-sm">— let us know you&apos;re coming</span>
              </div>
              <form onSubmit={handleRsvp} className="flex flex-col gap-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    maxLength={60}
                    className="rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:ring-2 text-sm"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      // @ts-expect-error ring color via CSS var workaround
                      "--tw-ring-color": "rgba(0,133,199,0.5)",
                    }}
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    maxLength={60}
                    className="rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:ring-2 text-sm"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      // @ts-expect-error ring color via CSS var workaround
                      "--tw-ring-color": "rgba(0,133,199,0.5)",
                    }}
                  />
                </div>
                {rsvpError && (
                  <p className="text-xs font-semibold" style={{ color: "#DF0024" }}>{rsvpError}</p>
                )}
                <button
                  type="submit"
                  disabled={rsvpSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-black text-white text-sm transition disabled:opacity-50"
                  style={{
                    background: rsvpSubmitting ? "rgba(0,133,199,0.4)" : "#0085C7",
                    boxShadow: rsvpSubmitting ? "none" : "0 0 16px rgba(0,133,199,0.3)",
                  }}
                >
                  <UserCheck className="w-4 h-4" />
                  {rsvpSubmitting ? "Sending…" : "I'm Coming"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            {
              icon: Trophy,
              color: "#F4C300",
              title: "How It Works",
              body: "Teams of 4 compete across 5 events all night long. Every win and bonus challenge earns points. Most points at the end wins the championship.",
            },
            {
              icon: Beer,
              color: "#0085C7",
              title: "BYOB",
              body: "This is a bring-your-own-beverage event. Pack whatever you're drinking — beer, seltzers, cocktails, or non-alcoholic. Just bring enough to last.",
            },
            {
              icon: Shirt,
              color: "#DF0024",
              title: "Themes & Costumes",
              body: "Every team picks a theme and dresses accordingly. Best costume earns bonus points — go all out. Pick a theme your whole team can commit to.",
            },
            {
              icon: UtensilsCrossed,
              color: "#009F6B",
              title: "Potluck Food",
              body: "This is a potluck event — everyone brings a dish. Head to the Potluck tab to sign up so we end up with a real spread. Appetizers, mains, sides, desserts — all welcome.",
            },
          ].map(({ icon: Icon, color, title, body }) => (
            <div
              key={title}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-2" style={{ background: `${color}22` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="font-black text-white">{title}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative"
        style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {[
            { value: "6", label: "Events", color: "#0085C7" },
            { value: "4", label: "Players per Team", color: "#F4C300" },
            { value: "★ Bonus", label: "Points for Costumes", color: "#009F6B" },
            { value: "$8", label: "Entry per Team", color: "#F4C300" },
            { value: "Potluck", label: "Bring a Dish", color: "#009F6B" },
          ].map(({ value, label, color }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-black mb-0.5" style={{ color }}>
                {value}
              </div>
              <div className="text-slate-400 font-semibold text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
