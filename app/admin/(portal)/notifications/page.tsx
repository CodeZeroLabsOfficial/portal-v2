import { connection } from "next/server";
import { redirect } from "next/navigation";

import { NotificationsPanel } from "@/components/features/notifications/notifications-panel";
import { requireStaffSession } from "@/lib/auth/server-session";
import { listNotificationsForRecipient } from "@/server/firestore/notifications";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  await connection();
  const user = await requireStaffSession();
  if (!user) {
    redirect("/login?next=/admin/notifications");
  }

  const notifications = await listNotificationsForRecipient(user, { limit: 100 });

  return <NotificationsPanel notifications={notifications} />;
}
