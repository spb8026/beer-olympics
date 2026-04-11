"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Bracket } from "@/types";

export function useBracket(gameId: string) {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "brackets", gameId),
      (snap) => {
        if (snap.exists()) {
          setBracket(snap.data() as Bracket);
        } else {
          setBracket(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsub;
  }, [gameId]);

  return { bracket, loading, error };
}
