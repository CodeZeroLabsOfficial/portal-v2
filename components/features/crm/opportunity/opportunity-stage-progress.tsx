"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AddProposalDialog } from "@/components/features/crm/customer/add-proposal-dialog";
import { CRM_DETAIL_LABEL_CLASS } from "@/components/shared/crm-detail-label";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { formatCurrencyAmount } from "@/lib/common/format";
import { OPPORTUNITY_STAGES, opportunityStageLabel } from "@/lib/crm/opportunity-stages";
import { opportunityStageChevronActiveClasses } from "@/lib/crm/opportunity-stage-chevron";
import { opportunityStageBadgeDisplay } from "@/lib/crm/status-badges";
import { cn } from "@/lib/utils";
import { useOpportunityStageMutation } from "@/hooks/use-opportunity-stage-mutation";
import type { CustomerRecord } from "@/types/customer";
import type { OpportunityRecord, OpportunityStage } from "@/types/opportunity";
import type { ProposalTemplateRecord } from "@/types/proposal-template";

const CHEVRON_CLIP =
  "[clip-path:polygon(0_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,0_100%,14px_50%)]";
const CHEVRON_CLIP_FIRST =
  "[clip-path:polygon(0_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,0_100%)]";

function stageVariantClasses(
  stage: OpportunityStage,
  variant: "active" | "completed" | "upcoming"
): string {
  if (variant === "active") {
    return opportunityStageChevronActiveClasses(stage);
  }
  if (variant === "completed") {
    return "bg-muted text-foreground/80";
  }
  return "bg-muted/40 text-muted-foreground";
}

export interface OpportunityStageProgressProps {
  opportunity: OpportunityRecord;
  customer: CustomerRecord;
  templates: ProposalTemplateRecord[];
}

export function OpportunityStageProgress({
  opportunity,
  customer,
  templates,
}: OpportunityStageProgressProps) {
  const { moveStage, pendingId } = useOpportunityStageMutation();
  const busy = pendingId === opportunity.id;
  const currentIndex = OPPORTUNITY_STAGES.indexOf(opportunity.stage);
  const stageBadge = opportunityStageBadgeDisplay(opportunity.stage);
  const [addProposalOpen, setAddProposalOpen] = React.useState(false);

  const startDate = opportunity.createdAt
    ? new Date(opportunity.createdAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-sm">
        <div className="border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/20 px-4 py-5 sm:px-6 md:px-8 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant="h1">{opportunity.name}</Typography>
                <StatusBadge label={stageBadge.label} variant={stageBadge.variant} />
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="font-medium text-primary hover:underline">
                  {customer.name || customer.email}
                </Link>
                {customer.phone ? (
                  <>
                    <span aria-hidden className="text-muted-foreground/60">
                      ·
                    </span>
                    <a href={`tel:${customer.phone}`} className="hover:text-foreground hover:underline">
                      {customer.phone}
                    </a>
                  </>
                ) : null}
                {customer.email ? (
                  <>
                    <span aria-hidden className="text-muted-foreground/60">
                      ·
                    </span>
                    <a href={`mailto:${customer.email}`} className="hover:text-foreground hover:underline">
                      {customer.email}
                    </a>
                  </>
                ) : null}
              </div>
              {typeof opportunity.amountMinor === "number" ? (
                <Typography variant="large" className="tabular-nums">
                  {formatCurrencyAmount(opportunity.amountMinor, opportunity.currency)}
                </Typography>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              className="shrink-0 gap-1.5 shadow-sm"
              onClick={() => setAddProposalOpen(true)}>
              <Plus className="size-3.5" aria-hidden />
              Add proposal
            </Button>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 md:px-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <dt className={CRM_DETAIL_LABEL_CLASS}>Start</dt>
              <dd className="text-sm tabular-nums">
                {startDate ? startDate : <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
            <div className="space-y-1 text-right">
              <dt className={CRM_DETAIL_LABEL_CLASS}>Current stage</dt>
              <dd className="text-sm font-medium">{opportunityStageLabel(opportunity.stage)}</dd>
            </div>
          </div>

          <div className="flex w-full min-w-0 items-stretch pb-1 pt-1">
            {OPPORTUNITY_STAGES.map((stage, i) => {
              const active = stage === opportunity.stage;
              const completed = i < currentIndex;
              const variant: "active" | "completed" | "upcoming" = active
                ? "active"
                : completed
                  ? "completed"
                  : "upcoming";
              return (
                <button
                  key={stage}
                  type="button"
                  disabled={busy || active}
                  onClick={() => {
                    if (stage !== opportunity.stage) void moveStage(opportunity.id, stage);
                  }}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Move stage to ${opportunityStageLabel(stage)}`}
                  className={cn(
                    "relative flex min-h-10 min-w-0 flex-1 items-center justify-center px-1 text-center text-xs font-medium leading-tight transition-colors sm:px-2 md:px-4",
                    i === 0 ? CHEVRON_CLIP_FIRST : cn("-ml-[14px]", CHEVRON_CLIP),
                    stageVariantClasses(stage, variant),
                    !active && !busy && "hover:brightness-110",
                    busy && "opacity-60"
                  )}>
                  {opportunityStageLabel(stage)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AddProposalDialog
        open={addProposalOpen}
        onOpenChange={setAddProposalOpen}
        customerId={customer.id}
        opportunityId={opportunity.id}
        templates={templates}
      />
    </>
  );
}
