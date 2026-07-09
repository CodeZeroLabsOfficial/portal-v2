import { getStorageFileSignedReadUrl } from "@/lib/firebase/admin-storage";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { parseSignedAgreementRecord } from "@/server/firestore/parse-signed-agreement";
import { COLLECTIONS } from "@/server/firestore/collections";
import { getCompanyDisplayName } from "@/server/firestore/organization-settings";
import type { SignedAgreementRecord } from "@/types/signed-agreement";

export type PublicSignedAgreementPayload = {
  record: SignedAgreementRecord;
  signatureSrc: string | null;
  companyPrintName?: string;
};

/** Resolves inline data URL or Storage signed URL for agreement signature display/print. */
export async function resolveSignedAgreementSignatureSrc(
  row: Pick<SignedAgreementRecord, "signatureImage" | "signatureImageStoragePath">,
): Promise<string | null> {
  if (row.signatureImage?.startsWith("data:image/")) {
    return row.signatureImage;
  }
  if (row.signatureImageStoragePath) {
    return getStorageFileSignedReadUrl(row.signatureImageStoragePath);
  }
  return null;
}

/** Strips bulky signature fields from the record passed to the browser. */
function publicSignedAgreementRecord(row: SignedAgreementRecord): SignedAgreementRecord {
  const { signatureImage: _img, signatureImageStoragePath: _path, ...rest } = row;
  return rest;
}

/**
 * Loads the frozen signed agreement for a public proposal share link.
 * Returns null when no matching row exists or proposalId does not match.
 */
export async function getSignedAgreementForPublicShare(
  shareToken: string,
  proposalId: string,
): Promise<PublicSignedAgreementPayload | null> {
  const token = shareToken.trim();
  const pid = proposalId.trim();
  if (!token || !pid) return null;

  const db = getFirebaseAdminFirestore();
  if (!db) return null;

  const snap = await db
    .collection(COLLECTIONS.signedAgreements)
    .where("shareToken", "==", token)
    .limit(20)
    .get();

  if (snap.empty) return null;

  let best: SignedAgreementRecord | null = null;
  for (const doc of snap.docs) {
    const parsed = parseSignedAgreementRecord(doc.id, doc.data() as Record<string, unknown>);
    if (!parsed || parsed.proposalId !== pid) continue;
    if (!best || parsed.signedAt > best.signedAt) {
      best = parsed;
    }
  }

  if (!best) return null;

  const signatureSrc = await resolveSignedAgreementSignatureSrc(best);
  const companyPrintName = await getCompanyDisplayName(best.organizationId);

  return {
    record: publicSignedAgreementRecord(best),
    signatureSrc,
    companyPrintName,
  };
}
