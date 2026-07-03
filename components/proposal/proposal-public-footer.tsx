"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { acceptProposalPublicAction } from "@/server/actions/proposal-builder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PROPOSAL_PUBLIC_PANEL_DESCRIPTION_CLASSES,
  PROPOSAL_PUBLIC_PANEL_TITLE_CLASSES,
} from "@/lib/proposal/public/public-typography";

export interface ProposalPublicFooterProps {
  shareToken: string;
  status: string;
  acceptedByName?: string;
  /**
   * When true, suppress the inline acceptance form — used when the proposal
   * contains an `agreement` block that drives signing through its own modal.
   * The “Accepted” confirmation card is still shown after acceptance.
   */
  hideAcceptanceForm?: boolean;
}

export function ProposalPublicFooter({
  shareToken,
  status,
  acceptedByName,
  hideAcceptanceForm = false,
}: ProposalPublicFooterProps) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(status === "accepted");
  const [localAcceptedName, setLocalAcceptedName] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDone(status === "accepted");
  }, [status]);

  async function accept(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await acceptProposalPublicAction({ shareToken, signerName: name.trim() });
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setLocalAcceptedName(name.trim());
    setDone(true);
    router.refresh();
  }

  const displayName = localAcceptedName ?? acceptedByName;
  const isAccepted = done || status === "accepted";

  if (!isAccepted && hideAcceptanceForm) {
    return null;
  }

  return (
    <div className="space-y-6">
      {isAccepted ? (
        <Alert className="border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50">
          <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" aria-hidden />
          <AlertTitle className="text-emerald-900 dark:text-emerald-100">Accepted</AlertTitle>
          <AlertDescription className="text-emerald-900/90 dark:text-emerald-50/90">
            Thank you{displayName ? `, ${displayName}` : ""}. We will follow up shortly with next steps.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className={PROPOSAL_PUBLIC_PANEL_TITLE_CLASSES}>Accept proposal</CardTitle>
            <CardDescription className={PROPOSAL_PUBLIC_PANEL_DESCRIPTION_CLASSES}>
              By accepting, you confirm you agree to the scope, pricing, and terms presented above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => void accept(e)}>
              <div className="space-y-2">
                <Label htmlFor="sign-name">Your full name</Label>
                <Input
                  id="sign-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  minLength={2}
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not accept</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="gap-2" disabled={busy || name.trim().length < 2}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Accept proposal
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
