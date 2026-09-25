import type { ComponentProps, ReactNode } from "react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** Bottom-border tabs. Overrides the default pill list. */
export const profileTabTriggerClassName =
  "data-[state=active]:border-b-primary data-[state=active]:bg-transparent! data-[state=active]:text-foreground data-[state=active]:shadow-none! text-muted-foreground h-auto! flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent! px-0 py-4 shadow-none! after:hidden";

export const profileTabsListClassName =
  "-mb-0.5 h-auto! w-full flex-wrap justify-start gap-6 overflow-x-visible border-none bg-transparent p-0";

export function ProfileTabBar({
  children,
  className,
  contentClassName
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("border-t", className)}>
      <div className={cn("px-4 sm:px-6 md:px-8", contentClassName)}>
        <TabsList className={profileTabsListClassName}>{children}</TabsList>
      </div>
    </div>
  );
}

export function ProfileTabTrigger({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger className={cn(profileTabTriggerClassName, className)} {...props} />;
}
