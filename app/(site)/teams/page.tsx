"use client";

import { useRef, useState } from "react";
import TeamSignupForm from "@/components/teams/TeamSignupForm";
import FreeAgentForm from "@/components/teams/FreeAgentForm";
import { useTeams } from "@/hooks/useTeams";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Users, Camera, Check, Loader } from "lucide-react";
import Image from "next/image";
import type { Team } from "@/types";

function TeamPhotoUpload({ team }: { team: Team }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`/api/teams/${team.id}/photo`, { method: "POST", body: form });
      if (!res.ok) {
        let msg = "Upload failed";
        try { msg = (await res.json()).error ?? msg; } catch { /* empty body */ }
        throw new Error(msg);
      }
      setUploaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const hasPhoto = !!team.photoUrl || uploaded;

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {error && <p className="text-xs text-red-400 mb-1">{error}</p>}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5 transition disabled:opacity-50"
        style={
          hasPhoto
            ? { background: "rgba(0,159,107,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }
            : { background: "rgba(255,255,255,0.07)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }
        }
      >
        {uploading ? (
          <Loader className="w-3.5 h-3.5 animate-spin" />
        ) : hasPhoto ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Camera className="w-3.5 h-3.5" />
        )}
        {uploading ? "Uploading…" : hasPhoto ? "Photo uploaded" : "Upload team photo"}
      </button>
    </div>
  );
}

export default function TeamsPage() {
  const { teams, loading } = useTeams();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-yellow-400 mb-2">Teams</h1>
        <p className="text-slate-400">
          Register your squad or sign up solo — we&apos;ll find you a home.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <TeamSignupForm />
        <FreeAgentForm />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-black text-white">
          Registered Teams
          <span className="ml-2 text-slate-500 font-normal text-base">({teams.length})</span>
        </h2>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : teams.length === 0 ? (
        <div className="text-center py-12 text-slate-600">No teams registered yet. Be the first!</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {teams.map((team, i) => {
            const colors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B"];
            const color = colors[i % colors.length];
            return (
              <div
                key={team.id}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div className="flex items-start gap-3">
                  {team.photoUrl && (
                    <Image
                      src={team.photoUrl}
                      alt={`${team.teamName} photo`}
                      width={56}
                      height={56}
                      className="rounded-xl object-cover shrink-0"
                      style={{ border: `2px solid ${color}44` }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-black text-white text-lg leading-tight">{team.teamName}</h3>
                      <span
                        className="shrink-0 text-xs rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                      >
                        {team.theme}
                      </span>
                    </div>
                    {team.players.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {team.players.map((player, pi) => (
                          <span
                            key={pi}
                            className="text-xs rounded-lg px-2.5 py-1 text-slate-300"
                            style={{ background: "rgba(255,255,255,0.07)" }}
                          >
                            {player}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <TeamPhotoUpload team={team} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
