import { CreditCard } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { CustomerRecord } from "@/types/customer";
import type { SubscriptionRecord } from "@/types/subscription";

export interface CustomerSubscriptionsTabProps {
  customer: CustomerRecord;
  subscriptions: SubscriptionRecord[];
}

export function CustomerSubscriptionsTab({
  customer,
  subscriptions
}: CustomerSubscriptionsTabProps) {
  return (
    <div className="space-y-4">
      {!customer.stripeCustomerId ? (
        <p className="text-muted-foreground text-sm">
          Link a Stripe customer id under Integrations to hydrate subscriptions and invoices from your
          webhook mirrors.
        </p>
      ) : null}

      <Card className="border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {subscriptions.length === 0 ? (
            <div className="p-6">
              <CustomerTabEmptyState icon={CreditCard} embedded>
                <p>No subscriptions for this customer yet.</p>
                <p>
                  Link a Stripe customer id under Integrations to sync subscription rows from your webhook
                  mirrors.
                </p>
              </CustomerTabEmptyState>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renews</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>{subscription.productName ?? "—"}</TableCell>
                    <TableCell className="capitalize">{subscription.status}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscription.subscriptionEnd || subscription.currentPeriodEnd
                        ? new Date(
                            subscription.subscriptionEnd ?? subscription.currentPeriodEnd ?? 0
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
