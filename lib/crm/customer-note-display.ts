import type { LucideIcon } from "lucide-react";
import { Mail, Phone, StickyNote } from "lucide-react";

import type { CustomerNoteKind } from "@/types/customer";

export const CUSTOMER_NOTE_KINDS = ["note", "call", "email"] as const satisfies readonly CustomerNoteKind[];

const NOTE_KIND_META: Record<CustomerNoteKind, { label: string; icon: LucideIcon }> = {
  note: { label: "Note", icon: StickyNote },
  call: { label: "Call", icon: Phone },
  email: { label: "Email", icon: Mail },
};

export function customerNoteKindMeta(kind: CustomerNoteKind) {
  return NOTE_KIND_META[kind];
}
