import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 [a&]:hover:bg-red-200/90 dark:[a&]:hover:bg-red-900/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        // Pastel status variants — match UI kit todo-list badge fills (borderless).
        warning:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 [a&]:hover:bg-yellow-200/90 dark:[a&]:hover:bg-yellow-900/90",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 [a&]:hover:bg-blue-200/90 dark:[a&]:hover:bg-blue-900/90",
        success:
          "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 [a&]:hover:bg-green-200/90 dark:[a&]:hover:bg-green-800/90",
        purple:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 [a&]:hover:bg-purple-200/90 dark:[a&]:hover:bg-purple-900/90",
        neutral:
          "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 [a&]:hover:bg-gray-300/90 dark:[a&]:hover:bg-gray-700/90",
        amber:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 [a&]:hover:bg-amber-200/90 dark:[a&]:hover:bg-amber-900/90",
        sky: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 [a&]:hover:bg-sky-200/90 dark:[a&]:hover:bg-sky-900/90",
        orange:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 [a&]:hover:bg-orange-200/90 dark:[a&]:hover:bg-orange-900/90"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
