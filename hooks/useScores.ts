"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TeamScore } from "@/types";

export function useScores() {
  const [scores, setScores] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scores"), (snap) => {
      setScores(snap.docs.map((d) => d.data() as TeamScore));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { scores, loading };
}
