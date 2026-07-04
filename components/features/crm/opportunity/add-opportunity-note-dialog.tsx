"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus } from "lucide-react";

import { CRM_ADD_NEW_BUTTON_CLASS } from "@/components/shared/crm-add-new-button";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addOpportunityNoteAction } from "@/server/actions/opportunities-crm";

export interface AddOpportunityNoteDialogProps {
  opportunityId: string;
}

export function AddOpportunityNoteDialog({ opportunityId }: AddOpportunityNoteDialogProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await addOpportunityNoteAction({ opportunityId, body });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setBody("");
      setAddOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={CRM_ADD_NEW_BUTTON_CLASS}>
          Add new
          <ChevronDown className="h-4 w-4 opacity-80" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>
            Save context, decisions, or follow-ups for this opportunity.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <FormServerError message={error} />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a note…"
            rows={5}
            className="resize-y"
            disabled={busy}
          />
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !body.trim()} className="gap-1.5">
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-3.5 w-3.5" aria-hidden />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
