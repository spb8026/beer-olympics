"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PlayerScore } from "@/types";

export function usePlayerScores() {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "playerScores"), (snap) => {
      setPlayerScores(snap.docs.map((d) => d.data() as PlayerScore));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { playerScores, loading };
}
