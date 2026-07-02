"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { CrmNoteEditor } from "@/components/shared/crm-note-editor";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isNoteBodyEmpty } from "@/lib/crm/customer-note-body";
import { CUSTOMER_NOTE_KINDS, customerNoteKindMeta } from "@/lib/crm/customer-note-display";
import { cn } from "@/lib/utils";
import { addCustomerNoteAction } from "@/server/actions/customers-crm";
import type { CustomerNoteKind } from "@/types/customer";

const ADD_NEW_BUTTON_CLASS =
  "shrink-0 gap-1.5 border-primary/40 bg-primary/5 text-primary shadow-none hover:bg-primary/10 hover:text-primary";

const EMPTY_EDITOR_VALUE = "<p></p>";

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
      <DialogContent className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <VisuallyHidden>
          <DialogTitle>Add note</DialogTitle>
        </VisuallyHidden>
        <form onSubmit={submit} className="flex flex-col p-6">
          <ButtonGroup className="mb-6 w-full sm:w-fit">
            {CUSTOMER_NOTE_KINDS.map((value) => {
              const { label, icon: Icon } = customerNoteKindMeta(value);
              const isActive = kind === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  aria-pressed={isActive}
                  className={cn(
                    "flex-1 gap-1.5 sm:flex-none",
                    isActive && "z-10 border-primary bg-primary/10 text-foreground"
                  )}
                  disabled={busy}
                  onClick={() => setKind(value)}>
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </Button>
              );
            })}
          </ButtonGroup>

          <FormServerError message={error} className="mb-4" />

          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            disabled={busy}
            maxLength={200}
            className="mb-4 rounded-none border-0 bg-transparent px-0 text-2xl shadow-none focus-visible:ring-0"
          />

          <CrmNoteEditor value={body} onChange={setBody} disabled={busy} />

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={busy || !canSubmit} className="min-w-28">
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Add note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
