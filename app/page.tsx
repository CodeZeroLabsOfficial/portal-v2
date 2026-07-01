import { redirect } from "next/navigation";

import { getCurrentSessionUser, isStaff } from "@/lib/auth/server-session";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login");
  }
  redirect(isStaff(user) ? "/admin" : "/dashboard");
}
