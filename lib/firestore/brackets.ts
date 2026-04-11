import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Bracket, Round } from "@/types";

export async function getBracket(gameId: string): Promise<Bracket | null> {
  const snap = await getDoc(doc(db, "brackets", gameId));
  if (!snap.exists()) return null;
  return snap.data() as Bracket;
}

export async function saveBracket(gameId: string, rounds: Round[]) {
  await setDoc(doc(db, "brackets", gameId), {
    gameId,
    generated: true,
    rounds,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBracketRounds(gameId: string, rounds: Round[]) {
  await updateDoc(doc(db, "brackets", gameId), {
    rounds,
    updatedAt: serverTimestamp(),
  });
}
