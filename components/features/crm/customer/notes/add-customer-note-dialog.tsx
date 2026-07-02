"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { addCustomerNoteAction } from "@/server/actions/customers-crm";
import type { CustomerNoteKind } from "@/types/customer";

const ADD_NEW_BUTTON_CLASS =
  "shrink-0 gap-1.5 border-primary/40 bg-primary/5 text-primary shadow-none hover:bg-primary/10 hover:text-primary";

const NOTE_KINDS: CustomerNoteKind[] = ["note", "call", "email"];

export interface AddCustomerNoteDialogProps {
  customerId: string;
}

export function AddCustomerNoteDialog({ customerId }: AddCustomerNoteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [body, setBody] = React.useState("");
  const [kind, setKind] = React.useState<CustomerNoteKind>("note");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function resetForm() {
    setBody("");
    setKind("note");
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await addCustomerNoteAction({ customerId, body, kind });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      resetForm();
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={ADD_NEW_BUTTON_CLASS}>
          Add new
          <ChevronDown className="h-4 w-4 opacity-80" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log entry</DialogTitle>
          <DialogDescription>
            Internal notes, calls, or email logs — visible to your organisation.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <FormServerError message={error} />
          <div className="flex flex-wrap gap-2">
            {NOTE_KINDS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  kind === value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:bg-muted/50"
                )}>
                {value}
              </button>
            ))}
          </div>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What happened?"
            rows={5}
            className="resize-y"
            disabled={busy}
          />
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
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
