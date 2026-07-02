import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface CustomerTabEmptyStateProps {
  icon: LucideIcon;
  title?: string;
  children: ReactNode;
  embedded?: boolean;
}

export function CustomerTabEmptyState({
  icon: Icon,
  title,
  children,
  embedded = false
}: CustomerTabEmptyStateProps) {
  const body = (
    <Empty className={cn("border-0 p-0", embedded && "py-12")}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="text-muted-foreground/50 size-10" aria-hidden />
        </EmptyMedia>
        {title ? <EmptyTitle>{title}</EmptyTitle> : null}
        <EmptyDescription className="max-w-sm space-y-2">{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  if (embedded) {
    return body;
  }

  return (
    <Card className="border-border/80 border-dashed bg-muted/15">
      <CardContent className="py-16">{body}</CardContent>
    </Card>
  );
}
