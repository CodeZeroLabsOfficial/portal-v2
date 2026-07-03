import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
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

interface AdminDashboardRecentTransactionsProps {
  payments: PaymentRecord[];
}

export function AdminDashboardRecentTransactions({
  payments,
}: AdminDashboardRecentTransactionsProps) {
  const recentPayments = [...payments]
    .sort((a, b) => (b.createdAt || b.updatedAt) - (a.createdAt || a.updatedAt))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent transactions</CardTitle>
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
              <TableHead className="w-[40%] pl-6">Transaction</TableHead>
              <TableHead className="w-[30%]">Amount</TableHead>
              <TableHead className="w-[30%] pr-6">Status</TableHead>
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
                    <TableCell className="truncate pl-6 font-mono text-xs">
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
                    <TableCell className="pr-6">
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
  );
}
