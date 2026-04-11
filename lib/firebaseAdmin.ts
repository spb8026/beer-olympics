import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (_db) return _db;

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!key || !projectId) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local"
    );
  }

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({ credential: cert(JSON.parse(key)), projectId });

  _db = getFirestore(app);
  return _db;
}

// Convenience proxy — lazy getter so module-level import doesn't trigger init
export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getAdminDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
