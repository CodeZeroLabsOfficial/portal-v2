import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { toSessionUserView } from "@/lib/auth/session-user-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentSessionUser();
  const view = user ? toSessionUserView(user) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Welcome{view ? `, ${view.displayName}` : ""}. Your account summary appears here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account summary</CardTitle>
          <CardDescription>
            Subscriptions, invoices, and payments are surfaced here in a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Head to Billing to manage your subscription and payment details.
        </CardContent>
      </Card>
    </div>
  );
}
