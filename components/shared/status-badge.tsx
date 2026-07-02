import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

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
      {label}
    </Badge>
  );
}

export { StatusBadge };
