import type { LucideIcon } from "lucide-react";
import { Mail, Phone, StickyNote } from "lucide-react";

import type { StatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { CustomerNoteKind } from "@/types/customer";

export const CUSTOMER_NOTE_KINDS = ["note", "call", "email"] as const satisfies readonly CustomerNoteKind[];

const NOTE_KIND_META: Record<
  CustomerNoteKind,
  { label: string; icon: LucideIcon; badge: StatusBadgeDisplay }
> = {
  note: { label: "Note", icon: StickyNote, badge: { label: "Note", variant: "secondary" } },
  call: { label: "Call", icon: Phone, badge: { label: "Call", variant: "info" } },
  email: { label: "Email", icon: Mail, badge: { label: "Email", variant: "sky" } },
};

export function customerNoteKindMeta(kind: CustomerNoteKind) {
  return NOTE_KIND_META[kind];
}
