"use client";

import { MessageSquare } from "lucide-react";

import { OpportunityActivitiesPanel } from "@/components/features/crm/opportunity/opportunity-activities-panel";
import { OpportunityNotesPanel } from "@/components/features/crm/opportunity/opportunity-notes-panel";
import { OpportunityStageProgress } from "@/components/features/crm/opportunity/opportunity-stage-progress";
import { PageBackButton } from "@/components/shared/page-back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerRecord } from "@/types/customer";
import type {
  OpportunityActivityRecord,
  OpportunityNoteRecord,
  OpportunityRecord,
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
  templates,
}: OpportunityDetailViewProps) {
  return (
    <div className="space-y-6">
      <PageBackButton href="/admin/opportunities" label="Pipeline" />

      <OpportunityStageProgress
        opportunity={opportunity}
        customer={customer}
        templates={templates}
      />

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
        <OpportunityActivitiesPanel customerId={customer.id} activities={activities} />
      </div>
    </div>
  );
}
