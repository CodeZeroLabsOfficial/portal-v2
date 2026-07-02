"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { CrmNoteEditor } from "@/components/shared/crm-note-editor";
import { FilterPillGroup } from "@/components/shared/filter-pill-group";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isNoteBodyEmpty } from "@/lib/crm/customer-note-body";
import { CUSTOMER_NOTE_KINDS, customerNoteKindMeta } from "@/lib/crm/customer-note-display";
import { addCustomerNoteAction } from "@/server/actions/customers-crm";
import type { CustomerNoteKind } from "@/types/customer";

const ADD_NEW_BUTTON_CLASS =
  "shrink-0 gap-1.5 border-primary/40 bg-primary/5 text-primary shadow-none hover:bg-primary/10 hover:text-primary";

const EMPTY_EDITOR_VALUE = "<p></p>";

const NOTE_KIND_OPTIONS = CUSTOMER_NOTE_KINDS.map((value) => {
  const meta = customerNoteKindMeta(value);
  return { value, label: meta.label, icon: meta.icon };
});

export interface AddCustomerNoteDialogProps {
  customerId: string;
}

export function AddCustomerNoteDialog({ customerId }: AddCustomerNoteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState(EMPTY_EDITOR_VALUE);
  const [kind, setKind] = React.useState<CustomerNoteKind>("note");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = !isNoteBodyEmpty(body, "html");

  function resetForm() {
    setTitle("");
    setBody(EMPTY_EDITOR_VALUE);
    setKind("note");
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const result = await addCustomerNoteAction({
        customerId,
        title: title.trim() || undefined,
        body,
        bodyFormat: "html",
        kind
      });
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
      <DialogContent className="max-h-screen max-w-(--breakpoint-sm) gap-0 overflow-y-auto p-0 lg:overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Add Note</DialogTitle>
        </VisuallyHidden>
        <form onSubmit={submit} className="p-6">
          <FilterPillGroup
            options={NOTE_KIND_OPTIONS}
            value={kind}
            onChange={setKind}
            disabled={busy}
            className="mb-6"
          />

          <FormServerError message={error} className="mb-4" />

          <div className="space-y-6">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              disabled={busy}
              maxLength={200}
              className="h-auto min-h-0 rounded-none border-0 bg-transparent! px-0 py-0 text-2xl! font-normal leading-tight shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
            />

            <CrmNoteEditor value={body} onChange={setBody} disabled={busy} className="w-full" />
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Button type="submit" disabled={busy || !canSubmit}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Add Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
