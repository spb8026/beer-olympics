"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Camera, Heart, Loader, Upload, ImageIcon, Tv, X } from "lucide-react";
import type { Photo } from "@/types";

// ─── Vote helpers ──────────────────────────────────────────────────────────

const VOTED_KEY = "beer-olympics-voted-photos";

function getVoted(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? "[]")); }
  catch { return new Set(); }
}
function saveVoted(s: Set<string>) {
  localStorage.setItem(VOTED_KEY, JSON.stringify([...s]));
}

// Each column scrolls at a slightly different speed (seconds for one full loop)
const DURATIONS = [48, 38, 54, 42];

function distributeToColumns(photos: Photo[], n: number): Photo[][] {
  const cols: Photo[][] = Array.from({ length: n }, () => []);
  photos.forEach((p, i) => cols[i % n].push(p));
  return cols;
}

// ─── Infinite-scroll column ────────────────────────────────────────────────

function InfiniteColumn({
  photos,
  duration,
  startDelay,
}: {
  photos: Photo[];
  duration: number;
  startDelay: number;
}) {
  if (photos.length === 0) return null;

  // Duplicate so translateY(-50%) loops seamlessly
  const doubled = [...photos, ...photos];

  return (
    <div className="flex-1 overflow-hidden min-w-0">
      <div
        className="flex flex-col gap-3"
        style={{
          animation: `photoScrollUp ${duration}s linear infinite`,
          animationDelay: `${startDelay}s`,
          willChange: "transform",
        }}
      >
        {doubled.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="rounded-xl overflow-hidden relative w-full shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Image
              src={photo.url}
              alt={photo.uploadedBy}
              width={600}
              height={900}
              style={{ width: "100%", height: "auto", display: "block" }}
              sizes="25vw"
              priority={i < 8}
            />
            <div
              className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 pt-6 text-xs font-semibold text-white/70 truncate"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
            >
              {photo.uploadedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Display overlay ───────────────────────────────────────────────────────

function DisplayMode({ photos, onExit }: { photos: Photo[]; onExit: () => void }) {
  const NUM_COLS = 4;
  const columns = useMemo(() => distributeToColumns(photos, NUM_COLS), [photos]);

  // Stagger start delays so columns are offset from each other
  const delays = useMemo(
    () => DURATIONS.map((d, i) => -(d * (i / NUM_COLS))),
    []
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex overflow-hidden"
      style={{ background: "#040a1a" }}
    >
      <style>{`
        @keyframes photoScrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>

      <div className="flex gap-3 w-full h-full p-3">
        {columns.map((col, i) => (
          <InfiniteColumn
            key={i}
            photos={col.length > 0 ? col : photos.slice(0, 1)}
            duration={DURATIONS[i]}
            startDelay={delays[i]}
          />
        ))}
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black backdrop-blur transition hover:opacity-100 opacity-30 hover:opacity-100 z-[101]"
        style={{ background: "rgba(4,10,26,0.8)", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}
      >
        <X className="w-4 h-4" /> Exit Display
      </button>

      {/* Photo count badge */}
      <div
        className="fixed bottom-6 left-6 text-xs font-bold opacity-20 z-[101]"
        style={{ color: "#94a3b8" }}
      >
        {photos.length} photos
      </div>
    </div>
  );
}

// ─── Upload form ───────────────────────────────────────────────────────────

function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Pick a photo first."); return; }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("photo", file);
      if (name.trim()) form.append("uploadedBy", name.trim());
      const res = await fetch("/api/photos", { method: "POST", body: form });
      if (!res.ok) {
        let msg = "Upload failed";
        try { msg = (await res.json()).error ?? msg; } catch { /* empty */ }
        throw new Error(msg);
      }
      setFile(null);
      setPreview(null);
      setName("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 mb-8"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-lg p-1.5" style={{ background: "rgba(244,195,0,0.15)" }}>
          <Camera className="w-4 h-4 text-yellow-400" />
        </div>
        <h2 className="font-black text-white">Share a Photo</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePick} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl transition"
          style={
            preview
              ? { background: "none", border: "none", padding: 0 }
              : { background: "rgba(255,255,255,0.04)", border: "2px dashed rgba(255,255,255,0.12)", padding: "1.5rem" }
          }
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="rounded-xl max-h-56 object-contain w-full" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-slate-600" />
              <span className="text-sm text-slate-500 font-semibold">Tap to take or choose a photo</span>
            </div>
          )}
        </button>
        {preview && (
          <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-slate-500 hover:text-slate-300 transition font-semibold">
            Change photo
          </button>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none text-sm"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
        />
        {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={uploading || !file}
          className="flex items-center justify-center gap-2 rounded-xl py-3 font-black text-slate-900 text-sm transition disabled:opacity-40"
          style={{ background: uploading || !file ? "#94a3b8" : "#F4C300", boxShadow: file && !uploading ? "0 0 16px rgba(244,195,0,0.25)" : "none" }}
        >
          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading…" : "Upload Photo"}
        </button>
      </form>
    </div>
  );
}

// ─── Photo card (normal mode) ──────────────────────────────────────────────

function PhotoCard({ photo, voted, onVote }: { photo: Photo; voted: boolean; onVote: (id: string) => void }) {
  return (
    <div
      className="break-inside-avoid mb-3 rounded-xl overflow-hidden group relative"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <Image
        src={photo.url}
        alt={`Photo by ${photo.uploadedBy}`}
        width={600}
        height={900}
        style={{ width: "100%", height: "auto", display: "block" }}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      {/* Gradient overlay — always visible at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-2.5 pb-2 pt-8"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}
      >
        <span className="text-white/80 text-xs font-semibold truncate max-w-[60%]">{photo.uploadedBy}</span>
        <button
          onClick={() => !voted && onVote(photo.id)}
          disabled={voted}
          className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-black transition"
          style={
            voted
              ? { color: "#f43f5e", background: "rgba(244,63,94,0.2)" }
              : { color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.3)" }
          }
        >
          <Heart className="w-3.5 h-3.5" fill={voted ? "#f43f5e" : "none"} strokeWidth={voted ? 0 : 2} />
          {photo.votes}
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [uploadKey, setUploadKey] = useState(0);
  const [displayMode, setDisplayMode] = useState(false);

  useEffect(() => { setVoted(getVoted()); }, []);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("votes", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photo)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleVote = useCallback(async (photoId: string) => {
    const next = new Set(voted);
    next.add(photoId);
    setVoted(next);
    saveVoted(next);
    setPhotos((prev) =>
      [...prev.map((p) => p.id === photoId ? { ...p, votes: p.votes + 1 } : p)]
        .sort((a, b) => b.votes - a.votes)
    );
    await fetch(`/api/photos/${photoId}/vote`, { method: "POST" });
  }, [voted]);

  return (
    <>
      {displayMode && (
        <DisplayMode photos={photos} onExit={() => setDisplayMode(false)} />
      )}

      <div className="px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 max-w-screen-2xl mx-auto">
          <div>
            <h1 className="text-4xl font-black text-yellow-400 mb-1 flex items-center gap-2">
              <Camera className="w-8 h-8" /> Party Photos
            </h1>
            <p className="text-slate-400">Share your shots and vote for your favorites.</p>
          </div>
          <button
            onClick={() => setDisplayMode(true)}
            disabled={photos.length === 0}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">Display Mode</span>
          </button>
        </div>

        <div className="max-w-screen-2xl mx-auto">
          <UploadForm key={uploadKey} onUploaded={() => setUploadKey((k) => k + 1)} />

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader className="w-8 h-8 text-slate-600 animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
            >
              <Camera className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500 font-semibold">No photos yet — be the first to share one!</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  voted={voted.has(photo.id)}
                  onVote={handleVote}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
