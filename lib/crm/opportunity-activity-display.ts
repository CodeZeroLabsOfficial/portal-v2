import type { LucideIcon } from "lucide-react";
import {
  CircleDot,
  FileText,
  Flag,
  Sparkles,
  Trophy,
  XCircle
} from "lucide-react";

import type { OpportunityActivityType } from "@/types/opportunity";

const ACTIVITY_TYPE_META: Record<
  OpportunityActivityType,
  { label: string; icon: LucideIcon }
> = {
  created: { label: "Created", icon: Sparkles },
  stage_changed: { label: "Stage changed", icon: Flag },
  proposal_created: { label: "Proposal created", icon: FileText },
  won: { label: "Won", icon: Trophy },
  lost: { label: "Lost", icon: XCircle },
  other: { label: "System", icon: CircleDot },
};

export function opportunityActivityTypeMeta(type: OpportunityActivityType) {
  return ACTIVITY_TYPE_META[type] ?? ACTIVITY_TYPE_META.other;
}

export function opportunityActivityIcon(type: OpportunityActivityType): LucideIcon {
  return opportunityActivityTypeMeta(type).icon;
}
