import { asString } from "@/lib/firestore/coerce";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { COLLECTIONS } from "@/server/firestore/collections";

export interface UserSummary {
  displayName: string;
  photoURL?: string;
}

function userSummaryFromDoc(id: string, data: Record<string, unknown>): UserSummary {
  const email = asString(data.email) ?? "";
  const dn = asString(data.displayName)?.trim();
  const displayName = dn || email || id;
  const photoURL = asString(data.photoURL);
  return { displayName, ...(photoURL ? { photoURL } : {}) };
}

/** Batch-load display names and avatars for portal user docs. */
export async function batchGetUserSummaries(uids: string[]): Promise<Map<string, UserSummary>> {
  const unique = [...new Set(uids.map((uid) => uid.trim()).filter(Boolean))];
  const summaries = new Map<string, UserSummary>();
  if (unique.length === 0) return summaries;

  const db = getFirebaseAdminFirestore();
  if (!db) return summaries;

  const chunkSize = 10;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const refs = chunk.map((uid) => db.collection(COLLECTIONS.users).doc(uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (!snap.exists) continue;
      summaries.set(snap.id, userSummaryFromDoc(snap.id, snap.data() as Record<string, unknown>));
    }
  }

  return summaries;
}
