import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ComingSoonPageProps {
  title: string;
  phase: string;
  description: string;
}

export function ComingSoonPage({ title, phase, description }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="secondary">{phase}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This section is part of {phase} in the portal rebuild. Navigation is wired early so you
            can explore the shell — functionality ships in that phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Settings (company, profile, locality, integrations) are available now from the sidebar footer.
        </CardContent>
      </Card>
    </div>
  );
}
