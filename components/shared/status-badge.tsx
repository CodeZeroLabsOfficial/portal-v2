import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/** Leading dots for the tinted status pills. */
const STATUS_DOT_CLASS: Partial<Record<NonNullable<BadgeVariant>, string>> = {
  success: "bg-green-500 dark:bg-green-400",
  destructive: "bg-rose-500 dark:bg-rose-400",
  amber: "bg-amber-500 dark:bg-amber-400",
};

/**
 * Shared, presentational status pill. Domain helpers should map a status value to
 * `{ label, variant, dot? }` (using `ui/badge` variants) and pass it here — never inline
 * one-off Tailwind status colors.
 *
 * The leading dot is opt-in. Customer, account, and subscription status, plus template
 * status, set `dot`. Other pills that share those colors do not.
 */
export interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  label: string;
  variant?: BadgeVariant;
  /** Leading dot. Customer, subscription, and template status only. */
  dot?: boolean;
}

function StatusBadge({
  label,
  variant = "secondary",
  dot = false,
  className,
  ...props
}: StatusBadgeProps) {
  const dotClass = dot && variant ? STATUS_DOT_CLASS[variant] : undefined;
  return (
    <Badge variant={variant} className={cn(className)} {...props}>
      {dotClass ? (
        <span className={cn("size-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
      ) : null}
      {label}
    </Badge>
  );
}

export { StatusBadge };
