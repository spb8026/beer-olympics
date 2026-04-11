import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Team } from "@/types";

export async function getTeams(): Promise<Team[]> {
  const q = query(collection(db, "teams"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Team));
}

export async function addTeam(
  data: Omit<Team, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "teams"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteTeam(id: string) {
  await deleteDoc(doc(db, "teams", id));
}

export async function updateTeam(id: string, data: Partial<Omit<Team, "id">>) {
  await updateDoc(doc(db, "teams", id), data);
}
