"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasTemplates) return;

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
        <form onSubmit={onSubmit} className="space-y-4">
          {hasTemplates ? (
            <div className="space-y-1.5">
              <Label htmlFor="proposal-template">Template</Label>
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
          ) : (
            <p className="text-muted-foreground text-sm">
              No proposal templates available. Create one in Templates first.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !hasTemplates}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Create proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
