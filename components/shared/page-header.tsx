import * as React from "react";

import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Standard page title block — matches UI kit dashboard page headers. */
function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-row items-center justify-between", className)}>
      <div className="space-y-1">
        <Typography variant="h1">{title}</Typography>
        {description ? <Typography variant="muted">{description}</Typography> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps };
