"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteConfig } from "@/types";
import { Save, Eye, EyeOff } from "lucide-react";

/** Converts any Firestore date representation to a JS Date */
function toDateObj(ts: unknown): Date {
  if (!ts) return new Date();
  if (typeof (ts as { toDate?: unknown }).toDate === "function")
    return (ts as { toDate: () => Date }).toDate();
  if (typeof ts === "object" && ts !== null && "seconds" in ts)
    return new Date((ts as { seconds: number }).seconds * 1000);
  if (typeof ts === "string") return new Date(ts);
  return new Date();
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f1f5f9",
};
const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

export default function ConfigEditor() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState({
    eventName: "",
    location: "",
    eventDateStr: "",
    accessCode: "",
    bracketsVisible: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SiteConfig;
        setConfig(data);
        setForm({
          eventName: data.eventName ?? "",
          location: data.location ?? "",
          eventDateStr: data.eventDate ? toDateObj(data.eventDate).toISOString().slice(0, 10) : "",
          accessCode: data.accessCode ?? "",
          bracketsVisible: data.bracketsVisible ?? false,
        });
      }
    });
    return unsub;
  }, []);

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = {
      eventName: form.eventName,
      location: form.location,
      accessCode: form.accessCode,
      bracketsVisible: form.bracketsVisible,
    };
    if (form.eventDateStr) body.eventDate = new Date(form.eventDateStr + "T12:00:00");
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!config) return null;

  return (
    <div>
      <h2 className="text-xl font-black text-yellow-400 mb-4">Site Config</h2>
      <div className="rounded-2xl p-6 flex flex-col gap-5" style={card}>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Event Name", key: "eventName", type: "text", mono: false },
            { label: "Location", key: "location", type: "text", mono: false },
            { label: "Event Date", key: "eventDateStr", type: "date", mono: false },
            { label: "Access Code", key: "accessCode", type: "text", mono: true },
          ].map(({ label, key, type, mono }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: key === "accessCode" ? e.target.value.toUpperCase() : e.target.value,
                  })
                }
                className={`rounded-lg px-4 py-3 focus:outline-none transition placeholder-slate-600 ${mono ? "font-mono tracking-widest" : ""}`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          ))}
        </div>

        {/* Brackets toggle */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="font-bold text-white text-sm">Brackets Visible to Guests</div>
            <div className="text-xs text-slate-600">Turn on game day to show live brackets</div>
          </div>
          <button
            onClick={() => setForm({ ...form, bracketsVisible: !form.bracketsVisible })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition"
            style={
              form.bracketsVisible
                ? { background: "#009F6B", color: "#fff" }
                : { background: "rgba(255,255,255,0.07)", color: "#64748b" }
            }
          >
            {form.bracketsVisible ? <><Eye className="w-4 h-4" /> Visible</> : <><EyeOff className="w-4 h-4" /> Hidden</>}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 font-black text-base rounded-xl py-3.5 transition disabled:opacity-40 text-slate-900"
          style={{ background: "#fbbf24" }}
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : saving ? "Saving..." : "Save Config"}
        </button>
      </div>
    </div>
  );
}
