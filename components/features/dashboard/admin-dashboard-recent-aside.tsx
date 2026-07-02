import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { formatCurrencyAmount } from "@/lib/common/format";
import { paymentStatusBadgeDisplay } from "@/lib/crm/payment-status-badge";
import { getProposalStageBadgeDisplay } from "@/lib/proposal/status-badge";
import type { AdminPortalData } from "@/server/firestore/portal-data";
import type { PaymentRecord } from "@/types/payment";

function shortRef(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
  if (clean.length < 6) {
    return `#${id.slice(0, 8)}`;
  }
  return `#${clean.slice(0, 3)}-${clean.slice(3, 6)}`;
}

function stripePaymentDashboardUrl(payment: PaymentRecord): string {
  const id = payment.stripePaymentIntentId?.trim() || payment.id.trim();
  return `https://dashboard.stripe.com/payments/${encodeURIComponent(id)}`;
}

interface AdminDashboardRecentAsideProps {
  data: AdminPortalData;
}

export function AdminDashboardRecentAside({ data }: AdminDashboardRecentAsideProps) {
  const recentPayments = [...data.payments]
    .sort((a, b) => (b.createdAt || b.updatedAt) - (a.createdAt || a.updatedAt))
    .slice(0, 5);

  const recentProposals = [...data.proposals].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);

  return (
    <aside className="space-y-4">
      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 pb-3">
          <CardTitle className="text-sm">Recent transactions</CardTitle>
          <Link
            href="https://dashboard.stripe.com/payments"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-0.5 text-xs font-medium hover:underline"
          >
            See all
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] pl-4">Transaction</TableHead>
                <TableHead className="w-[30%]">Amount</TableHead>
                <TableHead className="w-[30%] pr-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground py-8 text-center">
                    No payments recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                recentPayments.map((payment) => {
                  const status = paymentStatusBadgeDisplay(payment.status);
                  const refId = payment.stripePaymentIntentId?.trim() || payment.id;
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="truncate pl-4 font-mono text-xs">
                        <Link
                          href={stripePaymentDashboardUrl(payment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title={refId}
                        >
                          {shortRef(refId)}
                        </Link>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrencyAmount(payment.amount, payment.currency || DEFAULT_CURRENCY)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <StatusBadge label={status.label} variant={status.variant} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="flex flex-row items-center gap-2 border-b px-4 pb-3">
          <CardTitle className="text-sm">Recent proposals</CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase">
            Beta
          </Badge>
        </CardHeader>
        <CardContent className="px-2 py-1">
          {recentProposals.length === 0 ? (
            <p className="text-muted-foreground px-2 py-5 text-center text-xs">No recent activity</p>
          ) : (
            <ul className="divide-y">
              {recentProposals.map((proposal) => {
                const badge = getProposalStageBadgeDisplay(proposal);
                return (
                  <li key={proposal.id} className="flex items-start gap-3 px-2 py-3">
                    <span className="bg-primary/80 mt-1.5 size-2 shrink-0 rounded-full" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{proposal.title}</p>
                      <div className="mt-1">
                        <StatusBadge label={badge.label} variant={badge.variant} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
