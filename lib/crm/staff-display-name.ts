import type { PortalUser } from "@/types/user";

/** Label for automated CRM copy — prefers display name, then first/last, then email. */
export function staffDisplayNameForActivity(user: PortalUser): string {
  const fromDisplay = user.displayName?.trim();
  if (fromDisplay) return fromDisplay;
  const fn = user.firstName?.trim() ?? "";
  const ln = user.lastName?.trim() ?? "";
  const combined = [fn, ln].filter(Boolean).join(" ").trim();
  if (combined) return combined;
  const email = user.email?.trim();
  if (email) return email;
  return "Team member";
}
