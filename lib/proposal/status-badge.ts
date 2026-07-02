import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { ProposalRecord } from "@/types/proposal";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export type ProposalLifecyclePhase = "draft" | "published" | "viewed";

export type ProposalStageBadgeKey =
  | ProposalLifecyclePhase
  | "accepted"
  | "declined"
  | "expired";

/** Shared badge variants for proposal status across hub, customer detail, and proposal editor. */
export const PROPOSAL_STAGE_BADGE_VARIANT: Record<ProposalStageBadgeKey, BadgeVariant> = {
  draft: "warning",
  published: "info",
  viewed: "purple",
  accepted: "success",
  declined: "destructive",
  expired: "secondary",
};

/** CRM proposal rows: viewed wins over published over draft. */
export function proposalLifecyclePhase(p: ProposalRecord): ProposalLifecyclePhase {
  const viewed =
    p.status === "viewed" ||
    p.status === "accepted" ||
    p.status === "declined" ||
    (typeof p.viewCount === "number" && p.viewCount > 0) ||
    (typeof p.lastViewedAt === "number" && p.lastViewedAt > 0);
  if (viewed) return "viewed";
  if (p.status !== "draft") return "published";
  return "draft";
}

export function getProposalStageBadgeDisplay(p: ProposalRecord): {
  label: string;
  title: string;
  badgeKey: ProposalStageBadgeKey;
  variant: BadgeVariant;
} {
  if (p.status === "accepted") {
    return {
      label: "Accepted",
      title: "The client accepted this proposal on the public page.",
      badgeKey: "accepted",
      variant: PROPOSAL_STAGE_BADGE_VARIANT.accepted,
    };
  }
  if (p.status === "declined") {
    return {
      label: "Declined",
      title: "The client declined this proposal.",
      badgeKey: "declined",
      variant: PROPOSAL_STAGE_BADGE_VARIANT.declined,
    };
  }
  if (p.status === "expired") {
    return {
      label: "Expired",
      title: "This proposal is no longer active.",
      badgeKey: "expired",
      variant: PROPOSAL_STAGE_BADGE_VARIANT.expired,
    };
  }
  const phase = proposalLifecyclePhase(p);
  if (phase === "draft") {
    return {
      label: "Draft",
      title: "Draft — not published to a public link yet. Use Publish in the editor when ready.",
      badgeKey: "draft",
      variant: PROPOSAL_STAGE_BADGE_VARIANT.draft,
    };
  }
  if (phase === "published") {
    return {
      label: "Published",
      title: "Published — public proposal is ready to view; no recorded opens yet.",
      badgeKey: "published",
      variant: PROPOSAL_STAGE_BADGE_VARIANT.published,
    };
  }
  return {
    label: "Viewed",
    title: "Viewed — recipient has viewed or acted on the public proposal.",
    badgeKey: "viewed",
    variant: PROPOSAL_STAGE_BADGE_VARIANT.viewed,
  };
}
