import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { toSessionUserView } from "@/lib/session-user-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
          <Badge variant="secondary">Phase 0</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Welcome back{view ? `, ${view.displayName}` : ""}. The new portal shell is live — CRM,
          billing, and proposal screens are rebuilt in the following phases.
        </p>
      </div>

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
          <CardTitle>Foundation ready</CardTitle>
          <CardDescription>
            Authentication, session handling, API routes, and the domain layer have been carried
            over from the existing portal. Navigation links become active as each phase ships.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
