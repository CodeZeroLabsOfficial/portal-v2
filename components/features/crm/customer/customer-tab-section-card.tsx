import type { ReactNode } from "react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CustomerTabSectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function CustomerTabSectionCard({ title, action, children }: CustomerTabSectionCardProps) {
  return (
    <Card className="border-border/80 bg-card/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">{children}</CardContent>
    </Card>
  );
}
