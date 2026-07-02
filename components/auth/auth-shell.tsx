import React from "react";
import Link from "next/link";
import { SquareTerminalIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40 flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <SquareTerminalIcon className="size-4" />
          </div>
          <span className="font-semibold">Code Zero Labs</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            {footer ? (
              <p className="text-muted-foreground text-center text-xs">{footer}</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
