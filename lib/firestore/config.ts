import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { SiteConfig } from "@/types";

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const snap = await getDoc(doc(db, "config", "site"));
  if (!snap.exists()) return null;
  return snap.data() as SiteConfig;
}

export async function updateSiteConfig(data: Partial<SiteConfig>) {
  await updateDoc(doc(db, "config", "site"), data);
}
