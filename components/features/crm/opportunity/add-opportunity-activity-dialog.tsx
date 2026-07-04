"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Mail, Phone, Pin, Plus, Users } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addOpportunityActivityAction } from "@/server/actions/opportunities-crm";
import type { OpportunityActivityKind } from "@/types/opportunity";

const ACTIVITY_KINDS: { value: OpportunityActivityKind; label: string; Icon: typeof Phone }[] = [
  { value: "meeting", label: "Meeting", Icon: Users },
  { value: "call", label: "Phone call", Icon: Phone },
  { value: "email", label: "Email", Icon: Mail },
  { value: "other", label: "Other", Icon: Pin }
];

function toLocalDateTimeInputValue(ms: number): string {
  const d = new Date(ms);
  const tzOffsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export interface AddOpportunityActivityDialogProps {
  opportunityId: string;
}

export function AddOpportunityActivityDialog({ opportunityId }: AddOpportunityActivityDialogProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [kind, setKind] = React.useState<OpportunityActivityKind>("meeting");
  const [title, setTitle] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [occurredAt, setOccurredAt] = React.useState(() => toLocalDateTimeInputValue(Date.now()));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const occurredAtMs = occurredAt ? new Date(occurredAt).getTime() : undefined;
      const result = await addOpportunityActivityAction({
        opportunityId,
        kind,
        title,
        detail: detail.trim() ? detail : undefined,
        occurredAt:
          typeof occurredAtMs === "number" && Number.isFinite(occurredAtMs) ? occurredAtMs : undefined
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setTitle("");
      setDetail("");
      setOccurredAt(toLocalDateTimeInputValue(Date.now()));
      setKind("meeting");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add activity</DialogTitle>
          <DialogDescription>
            Log a meeting, phone call, email, or other touchpoint with this contact.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <FormServerError message={error} />

          <div className="flex flex-wrap gap-2">
            {ACTIVITY_KINDS.map(({ value, label, Icon }) => {
              const active = kind === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50"
                  )}
                  aria-pressed={active}>
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_minmax(0,11rem)]">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              disabled={busy}
              maxLength={240}
            />
            <Input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              disabled={busy}
              aria-label="When"
            />
          </div>

          <Textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Optional details…"
            rows={3}
            className="resize-y"
            disabled={busy}
            maxLength={4000}
          />

          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim()} className="gap-1.5">
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
