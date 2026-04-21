"use client";

import { useState } from "react";
import { UserCheck, Check } from "lucide-react";

export default function RsvpSection() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) {
        let msg = "Something went wrong";
        try { msg = (await res.json()).error ?? msg; } catch { /* empty body */ }
        throw new Error(msg);
      }
      setFirstName("");
      setLastName("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="relative"
      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div
                className="rounded-2xl p-3"
                style={{ background: "rgba(0,133,199,0.15)", border: "1px solid rgba(0,133,199,0.3)" }}
              >
                <UserCheck className="w-8 h-8" style={{ color: "#0085C7" }} />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              RSVP
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Let us know you&apos;re coming so we can get a headcount. Takes two seconds.
            </p>
          </div>

          {success ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "rgba(0,133,199,0.08)", border: "1px solid rgba(0,133,199,0.25)" }}
            >
              <div className="flex justify-center mb-4">
                <div
                  className="rounded-full p-3"
                  style={{ background: "rgba(0,133,199,0.2)" }}
                >
                  <Check className="w-8 h-8" style={{ color: "#0085C7" }} />
                </div>
              </div>
              <p className="text-white font-black text-xl mb-2">You&apos;re on the list!</p>
              <p className="text-slate-400 text-sm">See you there.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 text-sm font-semibold text-slate-500 hover:text-slate-300 transition"
              >
                RSVP for someone else
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-400">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Alex"
                      maxLength={60}
                      className="rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        // @ts-expect-error ring color via CSS var workaround
                        "--tw-ring-color": "rgba(0,133,199,0.5)",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-400">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Johnson"
                      maxLength={60}
                      className="rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        // @ts-expect-error ring color via CSS var workaround
                        "--tw-ring-color": "rgba(0,133,199,0.5)",
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-semibold" style={{ color: "#DF0024" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-black text-white transition disabled:opacity-50"
                  style={{
                    background: submitting ? "rgba(0,133,199,0.4)" : "#0085C7",
                    boxShadow: submitting ? "none" : "0 0 20px rgba(0,133,199,0.3)",
                  }}
                >
                  <UserCheck className="w-5 h-5" />
                  {submitting ? "Sending…" : "I'm Coming"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
