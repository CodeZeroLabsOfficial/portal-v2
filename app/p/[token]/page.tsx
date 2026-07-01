import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface PublicProposalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicProposalPage({ params }: PublicProposalPageProps) {
  await params;

  return (
    <div className="bg-muted/40 flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader>
          <CardTitle>Proposal</CardTitle>
          <CardDescription>
            The public proposal viewer is rebuilt in Phase 4. This route is reserved so shared links
            keep the same URL structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          If you were expecting a proposal here, please contact your Code Zero Labs representative.
        </CardContent>
      </Card>
    </div>
  );
}
