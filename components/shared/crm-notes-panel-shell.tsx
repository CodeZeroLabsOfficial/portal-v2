import type { ReactNode } from "react";

import { Typography } from "@/components/ui/typography";

export interface CrmNotesPanelShellProps {
  title: string;
  action: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function CrmNotesPanelShell({ title, action, toolbar, children }: CrmNotesPanelShellProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <Typography variant="h3" className="text-base">
          {title}
        </Typography>
        {action}
      </div>

      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-4 sm:px-5">
          {toolbar}
        </div>
      ) : null}

      <div className="bg-card px-4 py-5 sm:px-5">{children}</div>
    </div>
  );
}
