import { redirect } from "next/navigation";

import { getCurrentSessionUser, isStaff } from "@/lib/auth/server-session";

/** Staff auth gate for all `/admin/*` routes. Chrome is applied per route group — see `(portal)/layout.tsx`. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  if (!isStaff(user)) {
    redirect("/dashboard");
  }

  return children;
}
