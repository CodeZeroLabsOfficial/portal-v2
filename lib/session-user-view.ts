import type { PortalUser, UserRole } from "@/types/user";

export interface SessionUserView {
  displayName: string;
  email: string;
  initials: string;
  photoURL: string;
  roleLabel: string;
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  team: "Team",
  customer: "Customer",
};

function firstNonEmpty(...values: (string | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function deriveInitials(name: string, email: string): string {
  const source = name || email;
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

/** Serializable display projection of a {@link PortalUser} for the shell UI. */
export function toSessionUserView(user: PortalUser): SessionUserView {
  const combinedName = firstNonEmpty(
    user.displayName,
    user.name,
    [user.firstName, user.lastName].filter(Boolean).join(" "),
    user.email,
  );
  return {
    displayName: combinedName || "Account",
    email: user.email ?? "",
    initials: deriveInitials(combinedName, user.email ?? ""),
    photoURL: user.photoURL ?? "",
    roleLabel: ROLE_LABELS[user.role] ?? "Member",
    role: user.role,
  };
}
