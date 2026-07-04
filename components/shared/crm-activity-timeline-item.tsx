import type { LucideIcon } from "lucide-react";
import { Clock } from "lucide-react";

import { CrmActivityProposalLinkCard } from "@/components/shared/crm-activity-proposal-link-card";
import { Badge } from "@/components/ui/badge";

export interface CrmActivityTimelineItemProps {
  title: string;
  createdAt: number;
  icon: LucideIcon;
  isLatest?: boolean;
  isLast?: boolean;
  /** When set with `proposalTitle`, renders a linked proposal card below the date. */
  proposalHref?: string | null;
  proposalTitle?: string;
  /** Plain detail line; falls back to `typeSlug` when both are absent. */
  detail?: string;
  typeSlug?: string;
}

export function CrmActivityTimelineItem({
  title,
  createdAt,
  icon: Icon,
  isLatest = false,
  isLast = false,
  proposalHref,
  proposalTitle,
  detail,
  typeSlug,
}: CrmActivityTimelineItemProps) {
  const showProposalCard = Boolean(proposalHref?.trim());
  const detailText = detail?.trim() || (typeSlug ? typeSlug.replaceAll("_", " ") : "");

  return (
    <li className={`ms-6 space-y-2 ${isLast ? "" : "mb-10"}`}>
      <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border">
        <Icon className="text-primary size-3" aria-hidden />
      </span>
      <div className="space-y-1">
        <h3 className="flex flex-wrap items-center font-semibold">
          {title}
          {isLatest ? (
            <Badge variant="outline" className="ms-2">
              Latest
            </Badge>
          ) : null}
        </h3>
        <time
          dateTime={new Date(createdAt).toISOString()}
          className="text-muted-foreground flex items-center gap-1.5 text-sm leading-none">
          <Clock className="size-3" aria-hidden />
          {new Date(createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </div>
      {showProposalCard ? (
        <CrmActivityProposalLinkCard
          href={proposalHref!}
          title={proposalTitle?.trim() || "Proposal"}
        />
      ) : detailText ? (
        <p className="text-muted-foreground text-sm">{detailText}</p>
      ) : null}
    </li>
  );
}
