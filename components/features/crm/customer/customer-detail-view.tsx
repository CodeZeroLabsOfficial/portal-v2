"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CustomerContactDetailsCard } from "@/components/features/crm/customer/customer-contact-details-card";
import { CustomerDetailShell } from "@/components/features/crm/customer/customer-detail-shell";
import { CustomerIntegrationsCard } from "@/components/features/crm/customer/customer-integrations-card";
import { CustomerPortalAccessCard } from "@/components/features/crm/customer/customer-portal-access-card";
import { CustomerProfileCard } from "@/components/features/crm/customer/customer-profile-card";
import { CustomerBillingTab } from "@/components/features/crm/customer/tabs/billing-tab";
import { CustomerDocumentsTab } from "@/components/features/crm/customer/tabs/documents-tab";
import { CustomerNotesTab } from "@/components/features/crm/customer/tabs/notes-tab";
import { CustomerOverviewTab } from "@/components/features/crm/customer/tabs/overview-tab";
import { CustomerProposalsTab } from "@/components/features/crm/customer/tabs/proposals-tab";
import { CustomerSubscriptionsTab } from "@/components/features/crm/customer/tabs/subscriptions-tab";
import { CustomerTasksTab } from "@/components/features/crm/customer/tabs/tasks-tab";
import { CustomerVaultTab } from "@/components/features/crm/customer/tabs/vault-tab";
import { openInvoiceCount } from "@/lib/crm/customer-billing-metrics";
import { convertLeadToContactAction } from "@/server/actions/opportunities-crm";
import type { CustomerActivityRecord, CustomerNoteRecord, CustomerRecord } from "@/types/customer";
import type { InvoiceRecord } from "@/types/invoice";
import type { OpportunityRecord } from "@/types/opportunity";
import type { ProposalRecord } from "@/types/proposal";
import type { ProposalTemplateRecord } from "@/types/proposal-template";
import type { SignedAgreementRecord } from "@/types/signed-agreement";
import type { SubscriptionRecord } from "@/types/subscription";
import type { TaskRecord } from "@/types/task";

export interface CustomerDetailViewProps {
  customer: CustomerRecord;
  subscriptions: SubscriptionRecord[];
  invoices: InvoiceRecord[];
  proposalsMatched: ProposalRecord[];
  opportunities: OpportunityRecord[];
  notes: CustomerNoteRecord[];
  activities: CustomerActivityRecord[];
  tasks: TaskRecord[];
  templates: ProposalTemplateRecord[];
  signedAgreements: SignedAgreementRecord[];
  initialTab?: string;
}

export function CustomerDetailView({
  customer,
  subscriptions,
  invoices,
  proposalsMatched,
  opportunities,
  notes,
  activities,
  tasks,
  templates,
  signedAgreements,
  initialTab
}: CustomerDetailViewProps) {
  const router = useRouter();
  const [convertLeadBusy, setConvertLeadBusy] = React.useState(false);

  async function convertLead() {
    setConvertLeadBusy(true);
    try {
      const res = await convertLeadToContactAction({ customerId: customer.id });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.refresh();
    } finally {
      setConvertLeadBusy(false);
    }
  }

  return (
    <CustomerDetailShell
      customerId={customer.id}
      initialTab={initialTab}
      sidebar={
        <div className="space-y-4">
          <CustomerProfileCard
            customer={customer}
            subscriptionCount={subscriptions.length}
            openInvoiceCount={openInvoiceCount(invoices)}
            proposalCount={proposalsMatched.length}
            opportunityCount={opportunities.length}
          />
          <CustomerContactDetailsCard
            customer={customer}
            convertLeadBusy={convertLeadBusy}
            onConvertLead={() => void convertLead()}
          />
          <CustomerIntegrationsCard customer={customer} activities={activities} />
          <CustomerPortalAccessCard customer={customer} />
        </div>
      }
      panels={{
        overview: <CustomerOverviewTab customerId={customer.id} activities={activities} />,
        billing: <CustomerBillingTab customer={customer} invoices={invoices} />,
        subscriptions: (
          <CustomerSubscriptionsTab customer={customer} subscriptions={subscriptions} />
        ),
        proposals: (
          <CustomerProposalsTab
            customer={customer}
            proposalsMatched={proposalsMatched}
            templates={templates}
          />
        ),
        notes: <CustomerNotesTab customer={customer} notes={notes} activities={activities} />,
        documents: (
          <CustomerDocumentsTab customer={customer} signedAgreements={signedAgreements} />
        ),
        tasks: <CustomerTasksTab tasks={tasks} />,
        vault: <CustomerVaultTab />
      }}
    />
  );
}
