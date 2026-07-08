"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { verifyProposalSharePasswordAction } from "@/server/actions/proposal-builder";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PROPOSAL_PUBLIC_PANEL_DESCRIPTION_CLASSES,
  PROPOSAL_PUBLIC_PANEL_TITLE_CLASSES,
} from "@/lib/proposal/public/public-typography";

export interface ProposalPasswordGateProps {
  shareToken: string;
}

export function ProposalPasswordGate({ shareToken }: ProposalPasswordGateProps) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await verifyProposalSharePasswordAction({ shareToken, password });
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg border border-border/60">
          <Lock className="size-5" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <CardTitle className={PROPOSAL_PUBLIC_PANEL_TITLE_CLASSES}>Password required</CardTitle>
          <CardDescription className={PROPOSAL_PUBLIC_PANEL_DESCRIPTION_CLASSES}>
            Enter the password your contact shared with you to view this proposal.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => void submit(e)}>
          <div className="space-y-2">
            <Label htmlFor="gate-pw">Password</Label>
            <Input
              id="gate-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Could not unlock</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full gap-2" disabled={busy || password.length < 1}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Unlock proposal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
