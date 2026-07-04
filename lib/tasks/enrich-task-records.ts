import { isStaff } from "@/lib/auth/server-session";
import { asString } from "@/lib/firestore/coerce";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin-app";
import { batchGetCustomerRecordsForStaff } from "@/server/firestore/crm-customers";
import { COLLECTIONS } from "@/server/firestore/collections";
import type { TaskRecord } from "@/types/task";
import type { PortalUser } from "@/types/user";

function userSummaryFromDoc(
  id: string,
  data: Record<string, unknown>,
): { displayName: string; photoURL?: string } {
  const email = asString(data.email) ?? "";
  const dn = asString(data.displayName)?.trim();
  const displayName = dn || email || id;
  const photoURL = asString(data.photoURL);
  return { displayName, ...(photoURL ? { photoURL } : {}) };
}

function customerPickerLabel(customer: {
  company?: string;
  name?: string;
  email?: string;
}): string {
  return [customer.company?.trim(), customer.name?.trim(), customer.email?.trim()]
    .filter(Boolean)
    .join(" · ");
}

/** Batch-hydrate assignee and customer display fields for task list UIs. */
export async function enrichTaskRecordsForStaff(
  user: PortalUser,
  tasks: TaskRecord[],
): Promise<TaskRecord[]> {
  if (!isStaff(user) || tasks.length === 0) return tasks;

  const db = getFirebaseAdminFirestore();
  if (!db) return tasks;

  const customerIds = [
    ...new Set(tasks.map((t) => t.customerId?.trim()).filter((id): id is string => Boolean(id))),
  ];
  const customers = await batchGetCustomerRecordsForStaff(user, customerIds);

  const assigneeUids = [
    ...new Set(tasks.map((t) => t.assignedToUid?.trim()).filter((uid): uid is string => Boolean(uid))),
  ];

  const userSummaries = new Map<string, { displayName: string; photoURL?: string }>();
  const chunkSize = 10;
  for (let i = 0; i < assigneeUids.length; i += chunkSize) {
    const chunk = assigneeUids.slice(i, i + chunkSize);
    const refs = chunk.map((uid) => db.collection(COLLECTIONS.users).doc(uid));
    const snaps = await db.getAll(...refs);
    for (const s of snaps) {
      if (!s.exists) continue;
      userSummaries.set(s.id, userSummaryFromDoc(s.id, s.data() as Record<string, unknown>));
    }
  }

  return tasks.map((task): TaskRecord => {
    const customer = task.customerId ? customers.get(task.customerId) : undefined;
    const customerDisplayName = customer ? customerPickerLabel(customer) : undefined;
    const su = task.assignedToUid ? userSummaries.get(task.assignedToUid) : undefined;

    return {
      ...task,
      ...(customerDisplayName ? { customerDisplayName } : {}),
      ...(su?.displayName ? { assignedToDisplayName: su.displayName } : {}),
      ...(su?.photoURL ? { assignedToPhotoUrl: su.photoURL } : {}),
    };
  });
}
