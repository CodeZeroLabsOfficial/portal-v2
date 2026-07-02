import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import type { CustomerActivityRecord } from "@/types/customer";
import type { InvoiceRecord } from "@/types/invoice";
import type { OpportunityRecord } from "@/types/opportunity";
import type { ProposalRecord } from "@/types/proposal";
import type { SubscriptionRecord } from "@/types/subscription";

export interface CustomerOverviewTabProps {
  subscriptions: SubscriptionRecord[];
  invoices: InvoiceRecord[];
  proposalsMatched: ProposalRecord[];
  opportunities: OpportunityRecord[];
  activities: CustomerActivityRecord[];
}

export function CustomerOverviewTab({
  subscriptions,
  invoices,
  proposalsMatched,
  opportunities,
  activities
}: CustomerOverviewTabProps) {
  const timeline = activities
    .map((activity) => ({
      id: `a-${activity.id}`,
      at: activity.createdAt,
      label: activity.title,
      sub: activity.detail ?? activity.type
    }))
    .sort((a, b) => b.at - a.at)
    .slice(0, 24);

  const openInvoices = invoices.filter((invoice) => invoice.status === "open" || invoice.status === "draft")
    .length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Subscriptions</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{subscriptions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open invoices</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{openInvoices}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Proposals</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{proposalsMatched.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Opportunities</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{opportunities.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent timeline</CardTitle>
          <CardDescription>Activity and notes, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <CustomerTabEmptyState icon={Sparkles} embedded>
              <p>No activity yet.</p>
              <p>Notes, calls, emails, and Stripe syncs will show up here as they happen.</p>
            </CustomerTabEmptyState>
          ) : (
            <ul className="border-border/80 relative space-y-8 border-l pl-6">
              {timeline.map((item) => (
                <li key={item.id} className="relative">
                  <span className="border-border bg-background ring-muted absolute top-1.5 -left-[29px] size-2.5 rounded-full border ring-2" />
                  <p className="text-muted-foreground text-xs">
                    {new Date(item.at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.sub}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
