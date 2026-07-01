import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function CustomerBillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage your subscription, invoices, and payment methods.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Self-serve billing</CardTitle>
          <CardDescription>
            The Stripe billing portal, invoices, and payment history are wired up in a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Billing details will appear here once connected to your Stripe customer record.
        </CardContent>
      </Card>
    </div>
  );
}
