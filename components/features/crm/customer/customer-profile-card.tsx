"use client";

import { PencilIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { initialsFromName } from "@/lib/common/format";
import { customerAvatarUrl } from "@/lib/crm/customer-avatar";
import { customerCrmTypeBadgeDisplay, customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerProfileCardProps {
  customer: CustomerRecord;
  subscriptionCount: number;
  openInvoiceCount: number;
  proposalCount: number;
  opportunityCount: number;
  onEditClick?: () => void;
}

export function CustomerProfileCard({
  customer,
  subscriptionCount,
  openInvoiceCount,
  proposalCount,
  opportunityCount,
  onEditClick
}: CustomerProfileCardProps) {
  const avatarUrl = customerAvatarUrl(customer.avatarUrl);
  const displayName = customer.name?.trim() || customer.email;
  const statusBadge = customerStatusBadgeDisplay(customer.status === "archived" ? "archived" : "active");
  const crmTypeBadge = customerCrmTypeBadgeDisplay(customer.crmType);
  const company = customer.company?.trim();

  return (
    <Card className="relative">
      {onEditClick ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onEditClick}
          aria-label="Edit customer">
          <PencilIcon />
        </Button>
      ) : null}
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="size-20">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="text-lg font-semibold">
                {initialsFromName(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center">
              <h2 className="flex flex-wrap items-center justify-center gap-2 text-xl font-semibold">
                {displayName}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
                <StatusBadge label={crmTypeBadge.label} variant={crmTypeBadge.variant} />
              </div>
              {company ? (
                <p className="text-muted-foreground text-sm">{company}</p>
              ) : null}
            </div>
          </div>

          <div className="bg-muted grid grid-cols-4 divide-x rounded-md border text-center *:py-3">
            <div>
              <p className="text-lg font-semibold tabular-nums">{subscriptionCount}</p>
              <p className="text-muted-foreground text-xs">Subs</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{openInvoiceCount}</p>
              <p className="text-muted-foreground text-xs">Open</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{proposalCount}</p>
              <p className="text-muted-foreground text-xs">Prop</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{opportunityCount}</p>
              <p className="text-muted-foreground text-xs">Opp</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
