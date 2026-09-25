"use client";

import { ProfileHeroCard } from "@/components/shared/profile-hero-card";
import { ProfileTabTrigger } from "@/components/shared/profile-tab-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsFromName } from "@/lib/common/format";
import { customerAvatarUrl } from "@/lib/crm/customer-avatar";
import { customerCrmTypeBadgeDisplay, customerStatusBadgeDisplay } from "@/lib/crm/status-badges";
import type { CustomerRecord } from "@/types/customer";

export interface CustomerDetailHeroProps {
  customer: CustomerRecord;
  companyName?: string;
  onEditClick: () => void;
}

export function CustomerDetailHero({ customer, companyName, onEditClick }: CustomerDetailHeroProps) {
  const avatarUrl = customerAvatarUrl(customer.avatarUrl);
  const displayName = customer.name?.trim() || customer.email;
  const statusBadge = customerStatusBadgeDisplay(customer.status === "archived" ? "archived" : "active");
  const crmTypeBadge = customerCrmTypeBadgeDisplay(customer.crmType);
  const company = companyName?.trim();

  return (
    <ProfileHeroCard
      backHref="/admin/customers"
      backAriaLabel="Customers"
      onEditClick={onEditClick}
      editAriaLabel="Edit customer"
      avatar={
        <Avatar className="size-full rounded-none">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="rounded-none text-lg font-semibold">
            {initialsFromName(displayName)}
          </AvatarFallback>
        </Avatar>
      }
      title={displayName}
      meta={
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
            <StatusBadge label={crmTypeBadge.label} variant={crmTypeBadge.variant} />
          </div>
          {company ? <p className="text-muted-foreground text-sm">{company}</p> : null}
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
