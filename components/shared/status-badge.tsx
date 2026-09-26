import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/** Leading dot for the success pill (Active and the other green statuses). */
const SUCCESS_DOT_CLASS = "bg-green-500 dark:bg-green-400";

/**
 * Shared, presentational status pill. Domain helpers should map a status value to
 * `{ label, variant }` (using `ui/badge` variants) and pass it here — never inline
 * one-off Tailwind status colors.
 */
export interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  label: string;
  variant?: BadgeVariant;
}

function StatusBadge({ label, variant = "secondary", className, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={variant} className={cn(className)} {...props}>
      {variant === "success" ? (
        <span className={cn("size-1.5 shrink-0 rounded-full", SUCCESS_DOT_CLASS)} aria-hidden />
      ) : null}
      {label}
    </Badge>
  );
}

export { StatusBadge };
