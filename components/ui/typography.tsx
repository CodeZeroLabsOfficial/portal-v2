import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      /** Dashboard page title — matches UI kit `h1` pattern. */
      h1: "text-xl font-bold tracking-tight lg:text-2xl",
      /** Section heading. */
      h2: "text-2xl font-semibold tracking-tight",
      /** Subsection / card heading. */
      h3: "text-base font-semibold leading-none tracking-tight",
      h4: "text-sm font-semibold leading-none tracking-tight",
      /** Large metric / stat value — matches UI kit `font-display` cards. */
      display: "font-display text-2xl lg:text-3xl",
      /** Prominent metric (e.g. total revenue hero number). */
      "display-lg": "font-display text-3xl leading-6",
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
  display: "div",
  "display-lg": "div",
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
