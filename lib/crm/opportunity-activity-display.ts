import type { LucideIcon } from "lucide-react";
import { Mail, Phone, Pin, Users } from "lucide-react";

import type { OpportunityActivityKind } from "@/types/opportunity";

const ACTIVITY_KIND_META: Record<
  OpportunityActivityKind,
  { label: string; icon: LucideIcon }
> = {
  meeting: { label: "Meeting", icon: Users },
  call: { label: "Phone", icon: Phone },
  email: { label: "Email", icon: Mail },
  other: { label: "Other", icon: Pin }
};

export function opportunityActivityKindMeta(kind: OpportunityActivityKind) {
  return ACTIVITY_KIND_META[kind] ?? ACTIVITY_KIND_META.other;
}

export function opportunityActivityIcon(kind: OpportunityActivityKind): LucideIcon {
  return opportunityActivityKindMeta(kind).icon;
}
