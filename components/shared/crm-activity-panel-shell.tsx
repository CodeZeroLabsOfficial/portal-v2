import type { ReactNode } from "react";

import { Typography } from "@/components/ui/typography";

export interface CrmActivityPanelShellProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

/** Bordered CRM activity panel chrome — matches Notes panel shell; activity-specific API (no toolbar). */
export function CrmActivityPanelShell({ title, action, children }: CrmActivityPanelShellProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <Typography variant="h3" className="text-base">
          {title}
        </Typography>
        {action ?? null}
      </div>

      <div className="bg-card px-4 py-5 sm:px-5">{children}</div>
    </div>
  );
}
