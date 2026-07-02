import { notFound, redirect } from "next/navigation";

import { OpportunityDetailView } from "@/components/features/crm/opportunity/opportunity-detail-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { getCustomerRecordForOrg } from "@/server/firestore/crm-customers";
import {
  getOpportunityForStaff,
  listOpportunityActivities,
  listOpportunityNotes
} from "@/server/firestore/crm-opportunities";
import { listProposalTemplatesForOrg } from "@/server/firestore/proposal-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ opportunityId: string }>;
}

export default async function AdminOpportunityDetailPage({ params }: PageProps) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/opportunities");
  }

  const { opportunityId } = await params;
  const opportunity = await getOpportunityForStaff(user, opportunityId);
  if (!opportunity) {
    notFound();
  }

  const [customer, notes, activities, templates] = await Promise.all([
    getCustomerRecordForOrg(user, opportunity.customerId),
    listOpportunityNotes(user, opportunityId),
    listOpportunityActivities(user, opportunityId),
    listProposalTemplatesForOrg(user)
  ]);
  if (!customer) {
    notFound();
  }

  return (
    <OpportunityDetailView
      opportunity={opportunity}
      customer={customer}
      notes={notes}
      activities={activities}
      templates={templates}
    />
  );
}
