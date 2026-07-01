"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { getFirebaseClientAuth } from "@/lib/firebase/client-app";

/** Clears the browser Firebase session and the server session cookie. */
export async function signOutFromPortal(): Promise<void> {
  const auth = getFirebaseClientAuth();
  if (auth) {
    await signOut(auth).catch(() => undefined);
  }
  await fetch("/api/auth/logout", { method: "POST" });
}

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOutFromPortal();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
