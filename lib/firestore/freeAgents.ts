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
import type { FreeAgent } from "@/types";

export async function getFreeAgents(): Promise<FreeAgent[]> {
  const q = query(collection(db, "freeAgents"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FreeAgent));
}

export async function addFreeAgent(name: string): Promise<string> {
  const ref = await addDoc(collection(db, "freeAgents"), {
    name,
    assignedTeamId: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function assignFreeAgent(agentId: string, teamId: string) {
  await updateDoc(doc(db, "freeAgents", agentId), { assignedTeamId: teamId });
}

export async function deleteFreeAgent(id: string) {
  await deleteDoc(doc(db, "freeAgents", id));
}
