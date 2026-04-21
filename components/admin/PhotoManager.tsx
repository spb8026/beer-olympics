"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, RefreshCw, Heart } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Photo } from "@/types";

export default function PhotoManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchPhotos() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/photos");
      if (res.ok) {
        const list: Photo[] = await res.json();
        list.sort((a, b) => b.votes - a.votes);
        setPhotos(list);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPhotos(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setDeletingId(id);
    try {
      await fetch("/api/admin/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-black text-yellow-400 flex items-center gap-2">
          <Camera className="w-5 h-5" /> Party Photos
        </h2>
        <button
          onClick={fetchPhotos}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {photos.length} {photos.length === 1 ? "photo" : "photos"} — sorted by votes
      </p>

      {photos.length === 0 ? (
        <p className="text-slate-600 text-sm">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl overflow-hidden relative group"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Image
                src={photo.url}
                alt={`Photo by ${photo.uploadedBy}`}
                width={300}
                height={300}
                className="w-full h-40 object-cover block"
              />
              <div className="px-3 py-2 flex items-center justify-between" style={{ background: "rgba(4,10,26,0.95)" }}>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-300 truncate">{photo.uploadedBy}</p>
                  <p className="flex items-center gap-1 text-xs text-rose-400 font-semibold">
                    <Heart className="w-3 h-3" fill="#f43f5e" /> {photo.votes}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                  className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-950/50 transition disabled:opacity-30 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
