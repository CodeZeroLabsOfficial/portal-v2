import { notFound, redirect } from "next/navigation";

import { CustomerDetailView } from "@/components/features/crm/customer/customer-detail-view";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import {
  getCustomerRecordForOrg,
  listCustomerActivities,
  listCustomerNotes,
  listInvoicesForStripeCustomer,
  listProposalsLinkedToCustomer,
  listSignedAgreementsForCustomer,
  listSubscriptionsForStripeCustomer,
  listTasksForCustomer
} from "@/server/firestore/crm-customers";
import { listOpportunitiesForCustomer } from "@/server/firestore/crm-opportunities";
import { getAccountRecordForStaff } from "@/server/firestore/crm-accounts";
import { listProposalTemplatesForOrg } from "@/server/firestore/proposal-templates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ customerId: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AdminCustomerDetailPage({ params, searchParams }: PageProps) {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect("/login?next=/admin/customers");
  }

  const { customerId } = await params;
  const sp = searchParams ? await searchParams : {};
  const initialTab = typeof sp.tab === "string" ? sp.tab : undefined;

  const customer = await getCustomerRecordForOrg(user, customerId);
  if (!customer) {
    notFound();
  }

  const account = customer.accountId
    ? await getAccountRecordForStaff(user, customer.accountId)
    : null;

  const [
    notes,
    activities,
    subscriptions,
    invoices,
    proposalsMatched,
    signedAgreements,
    tasks,
    opportunities,
    templates
  ] = await Promise.all([
    listCustomerNotes(user, customerId),
    listCustomerActivities(user, customerId),
    listSubscriptionsForStripeCustomer(user, customer.stripeCustomerId),
    listInvoicesForStripeCustomer(user, customer.stripeCustomerId),
    listProposalsLinkedToCustomer(user, customerId, customer.email),
    listSignedAgreementsForCustomer(user, customerId),
    listTasksForCustomer(user, customerId),
    listOpportunitiesForCustomer(user, customerId),
    listProposalTemplatesForOrg(user)
  ]);

  return (
    <CustomerDetailView
      customer={customer}
      account={account}
      subscriptions={subscriptions}
      invoices={invoices}
      proposalsMatched={proposalsMatched}
      opportunities={opportunities}
      notes={notes}
      activities={activities}
      tasks={tasks}
      templates={templates}
      signedAgreements={signedAgreements}
      initialTab={initialTab}
    />
  );
}
