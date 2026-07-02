"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

import { FormServerError } from "@/components/shared/form-server-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  enableCustomerPortalAccessAction,
  generatePortalPasswordResetLinkAction
} from "@/server/actions/customers-crm";
import type { CustomerRecord } from "@/types/customer";

import { PortalPasswordLinkDialog } from "./portal-password-link-dialog";

const ghostButtonClassName = "gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground";

export interface CustomerPortalAccessCardProps {
  customer: CustomerRecord;
}

export function CustomerPortalAccessCard({ customer }: CustomerPortalAccessCardProps) {
  const router = useRouter();
  const [portalSetupLink, setPortalSetupLink] = React.useState<string | null>(null);
  const [passwordLinkModalOpen, setPasswordLinkModalOpen] = React.useState(false);
  const [portalSetupBusy, setPortalSetupBusy] = React.useState(false);
  const [enableAccessBusy, setEnableAccessBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPortalSetupLink(null);
    setPasswordLinkModalOpen(false);
    setError(null);
    setPortalSetupBusy(false);
    setEnableAccessBusy(false);
  }, [customer.id]);

  function onPasswordLinkModalOpenChange(open: boolean) {
    setPasswordLinkModalOpen(open);
    if (!open) {
      setPortalSetupLink(null);
    }
  }

  async function enablePortalAccess() {
    setError(null);
    setEnableAccessBusy(true);
    try {
      const res = await enableCustomerPortalAccessAction(customer.id);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.refresh();
    } finally {
      setEnableAccessBusy(false);
    }
  }

  async function generatePortalPasswordSetupLink() {
    setError(null);
    setPortalSetupBusy(true);
    try {
      const res = await generatePortalPasswordResetLinkAction(customer.id);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setPortalSetupLink(res.link);
      setPasswordLinkModalOpen(true);
    } finally {
      setPortalSetupBusy(false);
    }
  }

  const isLinked = Boolean(customer.portalUserId?.trim());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Portal access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>User access</Label>
            {isLinked ? (
              <StatusBadge label="Linked" variant="success" />
            ) : (
              <StatusBadge label="Not linked" variant="secondary" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isLinked ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={ghostButtonClassName}
                disabled={portalSetupBusy}
                onClick={() => void generatePortalPasswordSetupLink()}>
                {portalSetupBusy ? (
                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <KeyRound className="size-4 shrink-0" aria-hidden />
                )}
                Generate password link
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={ghostButtonClassName}
                disabled={!customer.email?.trim() || enableAccessBusy}
                title={!customer.email?.trim() ? "Add an email to this customer first." : undefined}
                onClick={() => void enablePortalAccess()}>
                {enableAccessBusy ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
                Link user
              </Button>
            )}
          </div>
          <FormServerError message={error} />
        </CardContent>
      </Card>

      <PortalPasswordLinkDialog
        open={passwordLinkModalOpen}
        onOpenChange={onPasswordLinkModalOpenChange}
        link={portalSetupLink}
      />
    </>
  );
}
