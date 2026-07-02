import type { ReactNode } from "react";

import { CustomerTabDateMeta } from "@/components/features/crm/customer/customer-tab-date-meta";

export interface CustomerDetailListRowProps {
  title: string;
  dateLabel: string;
  badge: ReactNode;
  meta: ReactNode;
  action: ReactNode;
}

export function CustomerDetailListRow({
  title,
  dateLabel,
  badge,
  meta,
  action,
}: CustomerDetailListRowProps) {
  return (
    <div className="bg-muted/50 flex items-center gap-4 rounded-lg border p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold leading-tight">{title}</p>
        <CustomerTabDateMeta label={dateLabel} />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {badge}
        {meta}
        {action}
      </div>
    </div>
  );
}
