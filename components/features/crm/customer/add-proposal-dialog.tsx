"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProposalTemplatePickerState } from "@/hooks/use-proposal-template-picker-state";
import { createDraftProposalFromCustomerAction } from "@/server/actions/proposals-crm";
import type { ProposalTemplateRecord } from "@/types/proposal-template";

export interface AddProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  templates: ProposalTemplateRecord[];
}

export function AddProposalDialog({
  open,
  onOpenChange,
  customerId,
  templates,
}: AddProposalDialogProps) {
  const router = useRouter();
  const { proposalTemplateId, setProposalTemplateId } = useProposalTemplatePickerState(templates);
  const [pending, setPending] = React.useState(false);

  const hasTemplates = templates.length > 0;
  const canSubmit = hasTemplates && proposalTemplateId.trim().length > 0 && !pending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    try {
      const res = await createDraftProposalFromCustomerAction(
        customerId,
        proposalTemplateId.trim() ? proposalTemplateId.trim() : undefined,
      );
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      onOpenChange(false);
      router.push(`/admin/proposals/${res.proposalId}?customer=${encodeURIComponent(customerId)}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create proposal. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add proposal</DialogTitle>
        </DialogHeader>
        {hasTemplates ? (
          <form onSubmit={onSubmit} className="mt-4 flex min-w-0 gap-2">
            <div className="min-w-0 flex-1">
              <Select
                value={proposalTemplateId}
                onValueChange={setProposalTemplateId}
                disabled={pending}>
                <SelectTrigger id="proposal-template" className="w-full">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              disabled={!canSubmit}
              aria-label="Create proposal">
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            No proposal templates available. Create one in Templates first.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
