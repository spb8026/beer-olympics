"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Game } from "@/types";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "games"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { games, loading };
}
