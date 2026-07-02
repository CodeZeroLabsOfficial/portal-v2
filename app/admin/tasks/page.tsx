import { connection } from "next/server";
import { redirect } from "next/navigation";

import { TasksPanel } from "@/components/features/crm/task/tasks-panel";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { listTasksForStaff } from "@/server/firestore/crm-tasks";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  await connection();
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/tasks");
  }

  const tasks = await listTasksForStaff(user);

  return (
    <TasksPanel tasks={tasks} viewerUid={user.uid} organizationId={user.organizationId} />
  );
}
