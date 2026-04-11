import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Game } from "@/types";

export async function getGames(): Promise<Game[]> {
  const q = query(collection(db, "games"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
}

export async function updateGame(id: string, data: Partial<Omit<Game, "id">>) {
  await updateDoc(doc(db, "games", id), data);
}
