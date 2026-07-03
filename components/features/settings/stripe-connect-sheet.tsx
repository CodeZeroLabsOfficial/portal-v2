"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormServerError } from "@/components/shared/form-server-error";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  updateIntegrationsSettingsSchema,
  type UpdateIntegrationsSettingsInput,
} from "@/lib/schemas/integrations-settings";
import type { StripeIntegrationStatus } from "@/lib/stripe/integration-status";
import {
  disconnectStripeIntegrationAction,
  updatePortalIntegrationsSettingsAction,
} from "@/server/actions/integrations-settings";
import type { PortalIntegrationsSettings } from "@/types/integrations";

function settingsToFormDefaults(settings: PortalIntegrationsSettings): UpdateIntegrationsSettingsInput {
  return {
    stripePublishableKey: settings.stripePublishableKey ?? "",
    webhookUrl: settings.webhookUrl ?? "",
  };
}

export interface StripeConnectSheetProps {
  settings: PortalIntegrationsSettings;
  stripeStatus: StripeIntegrationStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (settings: PortalIntegrationsSettings) => void;
}

export function StripeConnectSheet({
  settings,
  stripeStatus,
  open,
  onOpenChange,
  onSaved,
}: StripeConnectSheetProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [disconnectOpen, setDisconnectOpen] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);

  const hasPortalStripeConfig = Boolean(
    settings.stripePublishableKey?.trim() || settings.webhookUrl?.trim(),
  );

  const form = useForm<UpdateIntegrationsSettingsInput>({
    resolver: zodResolver(updateIntegrationsSettingsSchema),
    defaultValues: settingsToFormDefaults(settings),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(settingsToFormDefaults(settings));
      setServerError(null);
    }
  }, [open, settings, form]);

  async function onSubmit(values: UpdateIntegrationsSettingsInput) {
    setServerError(null);
    const result = await updatePortalIntegrationsSettingsAction(values);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    toast.success("Stripe settings saved");
    onSaved(result.settings);
    onOpenChange(false);
    router.refresh();
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const result = await disconnectStripeIntegrationAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Stripe disconnected");
      onSaved({});
      setDisconnectOpen(false);
      onOpenChange(false);
      router.refresh();
    } finally {
      setDisconnecting(false);
    }
  }

  const busy = form.formState.isSubmitting;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{hasPortalStripeConfig ? "Stripe integration" : "Connect Stripe"}</SheetTitle>
            <SheetDescription>
              {hasPortalStripeConfig
                ? "Update your Stripe publishable key and webhook URL, or disconnect the integration."
                : "Add your Stripe publishable key and webhook URL to accept online payments."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3 px-4">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-sm">Secret key</span>
              <Badge variant={stripeStatus.hasSecretKey ? "success" : "secondary"}>
                {stripeStatus.hasSecretKey ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-sm">Webhook secret</span>
              <Badge variant={stripeStatus.hasWebhookSecret ? "success" : "secondary"}>
                {stripeStatus.hasWebhookSecret ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-sm">Publishable key</span>
              <Badge variant={stripeStatus.hasPublishableKey ? "success" : "secondary"}>
                {stripeStatus.hasPublishableKey ? "Configured" : "Not configured"}
              </Badge>
            </div>
            {!stripeStatus.hasSecretKey || !stripeStatus.hasWebhookSecret ? (
              <p className="text-muted-foreground text-xs leading-relaxed">
                Add <code className="rounded bg-muted px-1 py-0.5">STRIPE_SECRET_KEY</code> and{" "}
                <code className="rounded bg-muted px-1 py-0.5">STRIPE_WEBHOOK_SECRET</code> to your deployment
                environment. Secret keys are never stored in the portal database.
              </p>
            ) : null}
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Open Stripe Dashboard
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 px-4" noValidate>
            <FormServerError message={serverError} />

            <div className="space-y-2">
              <Label htmlFor="stripe-publishable-key">Stripe publishable key</Label>
              <Input
                id="stripe-publishable-key"
                placeholder="pk_live_…"
                disabled={busy || disconnecting}
                {...form.register("stripePublishableKey")}
              />
              <p className="text-muted-foreground text-xs">
                Only the publishable key. Keep secret keys in server-side environment variables.
              </p>
              {form.formState.errors.stripePublishableKey ? (
                <p className="text-destructive text-xs">{form.formState.errors.stripePublishableKey.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripe-webhook-url">Notification webhook URL</Label>
              <Input
                id="stripe-webhook-url"
                placeholder="https://…"
                disabled={busy || disconnecting}
                {...form.register("webhookUrl")}
              />
              <p className="text-muted-foreground text-xs">
                Paste your Firebase <code className="rounded bg-muted px-1 py-0.5">stripeWebhook</code> endpoint URL
                for reference when configuring Stripe Dashboard.
              </p>
              {form.formState.errors.webhookUrl ? (
                <p className="text-destructive text-xs">{form.formState.errors.webhookUrl.message}</p>
              ) : null}
            </div>

            <SheetFooter className="flex-row justify-between px-0 sm:justify-between">
              {hasPortalStripeConfig ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy || disconnecting}
                  onClick={() => setDisconnectOpen(true)}
                >
                  Disconnect
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" disabled={busy || disconnecting}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Save
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Stripe?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your Stripe publishable key and webhook URL from the portal. Card payments will not work
              until you connect again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={disconnecting}
              onClick={(e) => {
                e.preventDefault();
                void handleDisconnect();
              }}
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
