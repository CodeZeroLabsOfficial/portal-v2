"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  updateNotificationPreferencesSchema,
  type UpdateNotificationPreferencesInput,
} from "@/lib/schemas/notification-preferences";
import { updateMyNotificationPreferencesAction } from "@/server/actions/notifications";
import type { NotificationPreferences } from "@/types/notification";

export interface NotificationPreferencesFormProps {
  initialPreferences: NotificationPreferences;
}

export function NotificationPreferencesForm({
  initialPreferences,
}: NotificationPreferencesFormProps) {
  const form = useForm<UpdateNotificationPreferencesInput>({
    resolver: zodResolver(updateNotificationPreferencesSchema),
    defaultValues: {
      inAppScope: initialPreferences.inAppScope,
      emailEnabled: initialPreferences.emailEnabled,
      securityEmail: true,
    },
  });

  React.useEffect(() => {
    form.reset({
      inAppScope: initialPreferences.inAppScope,
      emailEnabled: initialPreferences.emailEnabled,
      securityEmail: true,
    });
  }, [form, initialPreferences]);

  async function onSubmit(values: UpdateNotificationPreferencesInput) {
    const result = await updateMyNotificationPreferencesAction(values);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Notification preferences saved.");
  }

  const pending = form.formState.isSubmitting;

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="inAppScope"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Notify me about…</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col gap-2"
                    >
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="all" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          All in-app notifications
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="none" />
                        </FormControl>
                        <FormLabel className="font-normal">Nothing</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Controls the header inbox and notifications page. You can refine
                    categories later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="mb-4 text-lg font-medium">Email notifications</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email alerts</FormLabel>
                        <FormDescription>
                          Preference is saved now; outbound email delivery will use this
                          when the mailer is wired.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="securityEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Security emails</FormLabel>
                        <FormDescription>
                          Account security alerts stay on when those events are available.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Update notifications
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
