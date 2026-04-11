"use client";

import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Check if admin cookie is already set by doing a probe request
  useEffect(() => {
    fetch("/api/admin-probe")
      .then((r) => {
        if (r.ok) setAuthed(true);
        else setAuthed(false);
      })
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-amber-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <>{children}</>;
}
