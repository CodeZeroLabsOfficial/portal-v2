import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CircleDot,
  CreditCard,
  FileText,
  KeyRound,
  MessageSquare,
  Pencil,
  Sparkles,
  UserPlus,
  Briefcase
} from "lucide-react";

import type { CustomerActivityRecord } from "@/types/customer";

const ACTIVITY_ICON_MAP: Record<CustomerActivityRecord["type"], LucideIcon> = {
  created: UserPlus,
  updated: Pencil,
  note: MessageSquare,
  stripe_sync: CreditCard,
  auth_linked: KeyRound,
  archived: Archive,
  lead_converted: Sparkles,
  opportunity_created: Briefcase,
  proposal_created: FileText,
  other: CircleDot
};

export function customerActivityIcon(type: CustomerActivityRecord["type"]): LucideIcon {
  return ACTIVITY_ICON_MAP[type] ?? CircleDot;
}
