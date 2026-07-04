"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Loader2, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";

import { OpportunityActivitiesPanel } from "@/components/features/crm/opportunity/opportunity-activities-panel";
import { OpportunityNotesPanel } from "@/components/features/crm/opportunity/opportunity-notes-panel";
import { OpportunityStageProgress } from "@/components/features/crm/opportunity/opportunity-stage-progress";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useProposalTemplatePickerState } from "@/hooks/use-proposal-template-picker-state";
import { createDraftProposalFromOpportunityAction } from "@/server/actions/proposals-crm";
import type { CustomerRecord } from "@/types/customer";
import type {
  OpportunityActivityRecord,
  OpportunityNoteRecord,
  OpportunityRecord
} from "@/types/opportunity";
import type { ProposalTemplateRecord } from "@/types/proposal-template";

export interface OpportunityDetailViewProps {
  opportunity: OpportunityRecord;
  customer: CustomerRecord;
  notes: OpportunityNoteRecord[];
  activities: OpportunityActivityRecord[];
  templates: ProposalTemplateRecord[];
}

export function OpportunityDetailView({
  opportunity,
  customer,
  notes,
  activities,
  templates
}: OpportunityDetailViewProps) {
  const router = useRouter();
  const { proposalTemplateId, setProposalTemplateId } = useProposalTemplatePickerState(templates);
  const [proposalBusy, setProposalBusy] = React.useState(false);

  async function createProposalFromOpportunity() {
    setProposalBusy(true);
    try {
      const res = await createDraftProposalFromOpportunityAction(
        opportunity.id,
        proposalTemplateId.trim() ? proposalTemplateId.trim() : undefined
      );
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.push(`/admin/proposals/${res.proposalId}?customer=${encodeURIComponent(customer.id)}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create proposal. Please try again.");
    } finally {
      setProposalBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/opportunities" aria-label="Back to Pipeline">
            <ChevronLeft className="size-4" aria-hidden />
          </Link>
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/opportunities">Pipeline</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                {opportunity.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <OpportunityStageProgress opportunity={opportunity} customer={customer} />

      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
            <CardTitle>Add proposal</CardTitle>
          </div>
          <CardDescription>
            Creates a draft linked to this opportunity so when the buyer signs the agreement, this deal can move to
            Won automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          {templates.length > 0 ? (
            <Select
              value={proposalTemplateId}
              onValueChange={setProposalTemplateId}
              disabled={proposalBusy}>
              <SelectTrigger className="min-w-[220px]" aria-label="Template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="gap-1.5 shadow-sm"
            disabled={proposalBusy}
            onClick={() => void createProposalFromOpportunity()}>
            {proposalBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden />
            )}
            Add proposal
          </Button>
        </CardContent>
      </Card>

      {opportunity.notes?.trim() ? (
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden />
              <CardTitle>Opportunity summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{opportunity.notes.trim()}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <OpportunityNotesPanel opportunityId={opportunity.id} notes={notes} />
        <OpportunityActivitiesPanel opportunityId={opportunity.id} activities={activities} />
      </div>
    </div>
  );
}
