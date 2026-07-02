import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { toSessionUserView } from "@/lib/auth/session-user-view";

export const dynamic = "force-dynamic";

const PLACEHOLDER_METRICS = [
  { label: "Monthly recurring revenue", value: "—", hint: "Wired in Phase 3" },
  { label: "Active subscriptions", value: "—", hint: "Wired in Phase 3" },
  { label: "Open proposals", value: "—", hint: "Wired in Phase 4" },
  { label: "Customers", value: "—", hint: "Wired in Phase 2" },
];

export default async function AdminDashboardPage() {
  const user = await getCurrentSessionUser();
  const view = user ? toSessionUserView(user) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations"
        description={`Welcome back${view ? `, ${view.displayName}` : ""}. Settings are live — CRM, billing, and proposal screens ship in upcoming phases.`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Phase 1</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/settings">Settings</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLACEHOLDER_METRICS.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s new in Phase 1</CardTitle>
          <CardDescription>
            Company, profile, locality, and integrations settings are available under Settings in the
            sidebar. Other navigation links show a preview until their phase ships.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
