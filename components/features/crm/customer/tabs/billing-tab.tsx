import Link from "next/link";
import { CreditCard, Download, FileText } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyAmount } from "@/lib/common/format";
import type { CustomerRecord } from "@/types/customer";
import type { InvoiceRecord } from "@/types/invoice";
import type { SubscriptionRecord } from "@/types/subscription";

export interface CustomerBillingTabProps {
  customer: CustomerRecord;
  subscriptions: SubscriptionRecord[];
  invoices: InvoiceRecord[];
}

export function CustomerBillingTab({ customer, subscriptions, invoices }: CustomerBillingTabProps) {
  return (
    <>
      {!customer.stripeCustomerId ? (
        <p className="text-muted-foreground text-sm">
          Link a Stripe customer id under Integrations to hydrate subscriptions and invoices from your webhook
          mirrors.
        </p>
      ) : null}

      <Card className="border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {subscriptions.length === 0 ? (
            <CustomerTabEmptyState icon={CreditCard} embedded>
              <p>No subscriptions for this customer yet.</p>
              <p>
                Link a Stripe customer id under Integrations to sync subscription rows from your webhook
                mirrors.
              </p>
            </CustomerTabEmptyState>
          ) : (
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-border border-b">
                  <th className="py-2 pr-4 font-medium">Product</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Renews</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-border/60 border-b last:border-0">
                    <td className="py-2 pr-4">{subscription.productName ?? "—"}</td>
                    <td className="py-2 pr-4 capitalize">{subscription.status}</td>
                    <td className="text-muted-foreground py-2">
                      {subscription.subscriptionEnd || subscription.currentPeriodEnd
                        ? new Date(
                            subscription.subscriptionEnd ?? subscription.currentPeriodEnd ?? 0
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {invoices.length === 0 ? (
            <CustomerTabEmptyState icon={FileText} embedded>
              <p>No invoices for this customer yet.</p>
              <p>Invoice rows appear here once Stripe billing activity is linked and synced.</p>
            </CustomerTabEmptyState>
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-border border-b">
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Issued</th>
                  <th className="py-2 font-medium">Open</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-border/60 border-b last:border-0">
                    <td className="py-2 pr-4 capitalize">{invoice.status}</td>
                    <td className="py-2 pr-4">
                      {formatCurrencyAmount(invoice.amountDue, invoice.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2">
                      {invoice.hostedInvoiceUrl || invoice.invoicePdf ? (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {invoice.hostedInvoiceUrl ? (
                            <Link
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-xs font-medium hover:underline">
                              View
                            </Link>
                          ) : null}
                          {invoice.invoicePdf ? (
                            <Link
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline">
                              <Download className="size-3.5 shrink-0" aria-hidden />
                              PDF
                            </Link>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
