import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboardReportsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Exportable analytics and scheduled reports will appear here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Reports coming soon.</p>
      </CardContent>
    </Card>
  );
}
