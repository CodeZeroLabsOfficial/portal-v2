import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-3xl font-semibold tracking-tight text-balance",
      h2: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-lg font-semibold tracking-tight",
      p: "leading-7",
      lead: "text-lg text-muted-foreground",
      large: "text-base font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

const variantElementMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
} as const;

export type TypographyVariant = keyof typeof variantElementMap;

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  /** Override the rendered element (defaults to a sensible tag per variant). */
  as?: React.ElementType;
}

function Typography({ className, variant = "p", as, ...props }: TypographyProps) {
  const Comp = (as ?? variantElementMap[variant ?? "p"]) as React.ElementType;

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Typography, typographyVariants };
