import type { LucideIcon } from "lucide-react";

export const CRM_DETAIL_LABEL_CLASS =
  "flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export const CRM_DETAIL_LABEL_ICON_CLASS = "size-3.5 shrink-0 opacity-80";

export interface CrmDetailLabelProps {
  icon: LucideIcon;
  children: React.ReactNode;
}

export function CrmDetailLabel({ icon: Icon, children }: CrmDetailLabelProps) {
  return (
    <dt className={CRM_DETAIL_LABEL_CLASS}>
      <Icon className={CRM_DETAIL_LABEL_ICON_CLASS} aria-hidden />
      {children}
    </dt>
  );
}

export function CrmDetailValue({
  children,
  empty = false
}: {
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <dd className={empty ? "text-muted-foreground text-sm" : "text-sm"}>
      {children}
    </dd>
  );
}
