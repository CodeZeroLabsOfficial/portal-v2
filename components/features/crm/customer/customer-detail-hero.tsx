"use client";

import { ProfileHeroCard } from "@/components/shared/profile-hero-card";
import { ProfileTabTrigger } from "@/components/shared/profile-tab-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initialsFromName } from "@/lib/common/format";
import { customerAvatarUrl } from "@/lib/crm/customer-avatar";
import { customerCrmTypeBadgeDisplay, customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import { customerTagKey, customerTagSwatch } from "@/lib/customer/tags";
import { cn } from "@/lib/utils";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerDetailHeroProps {
  customer: CustomerRecord;
  onEditClick: () => void;
}

export function CustomerDetailHero({ customer, onEditClick }: CustomerDetailHeroProps) {
  const avatarUrl = customerAvatarUrl(customer.avatarUrl);
  const displayName = customer.name?.trim() || customer.email;
  const statusBadge = customerStatusBadgeDisplay(customer.status === "archived" ? "archived" : "active");
  const crmTypeBadge = customerCrmTypeBadgeDisplay(customer.crmType);

  return (
    <ProfileHeroCard
      backHref="/admin/customers"
      backAriaLabel="Customers"
      onEditClick={onEditClick}
      editAriaLabel="Edit customer"
      avatar={
        <Avatar className="size-full rounded-none after:hidden">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" className="rounded-none" /> : null}
          <AvatarFallback className="rounded-none bg-transparent text-lg font-semibold text-foreground">
            {initialsFromName(displayName)}
          </AvatarFallback>
        </Avatar>
      }
      title={displayName}
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={statusBadge.label}
            variant={statusBadge.variant}
            dot={statusBadge.dot}
          />
          <StatusBadge label={crmTypeBadge.label} variant={crmTypeBadge.variant} />
          {customer.tags.map((tag) => {
            const swatch = customerTagSwatch(tag);
            return (
              <Badge key={customerTagKey(tag)} variant="outline" className="gap-1.5 font-normal">
                {swatch ? (
                  <span className={cn("size-2 shrink-0 rounded-full", swatch)} aria-hidden />
                ) : null}
                {tag}
              </Badge>
            );
          })}
        </div>
      }
      tabs={
        <>
          <ProfileTabTrigger value="overview">Overview</ProfileTabTrigger>
          <ProfileTabTrigger value="billing">Billing</ProfileTabTrigger>
          <ProfileTabTrigger value="subscriptions">Subscriptions</ProfileTabTrigger>
          <ProfileTabTrigger value="proposals">Proposals</ProfileTabTrigger>
          <ProfileTabTrigger value="notes">Notes</ProfileTabTrigger>
          <ProfileTabTrigger value="documents">Documents</ProfileTabTrigger>
          <ProfileTabTrigger value="tasks">Tasks</ProfileTabTrigger>
          <ProfileTabTrigger value="vault">Vault</ProfileTabTrigger>
        </>
      }
    />
  );
}
