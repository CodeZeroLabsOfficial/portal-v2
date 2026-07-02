import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function CustomerOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Your account summary and recent activity."
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer dashboard</CardTitle>
          <CardDescription>
            Billing metrics, invoices, and shared proposals will appear here in a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Use Billing in the sidebar to manage your subscription when self-serve billing is wired up.
        </CardContent>
      </Card>
    </div>
  );
}
