"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";
import { FormServerError } from "@/components/shared/form-server-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addCustomerNoteAction } from "@/server/actions/customers-crm";
import type { CustomerActivityRecord, CustomerNoteRecord, CustomerRecord } from "@/types/customer";

export interface CustomerNotesTabProps {
  customer: CustomerRecord;
  notes: CustomerNoteRecord[];
  activities: CustomerActivityRecord[];
}

export function CustomerNotesTab({ customer, notes, activities }: CustomerNotesTabProps) {
  const router = useRouter();
  const [noteBody, setNoteBody] = React.useState("");
  const [noteKind, setNoteKind] = React.useState<CustomerNoteRecord["kind"]>("note");
  const [error, setError] = React.useState<string | null>(null);

  async function submitNote(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await addCustomerNoteAction({
      customerId: customer.id,
      body: noteBody,
      kind: noteKind
    });
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setNoteBody("");
    router.refresh();
  }

  return (
    <>
      <Card className="border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Add entry</CardTitle>
          <CardDescription>Internal notes, calls, or email logs — visible to your organisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submitNote}>
            <FormServerError message={error} />
            <div className="flex flex-wrap gap-2">
              {(["note", "call", "email"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setNoteKind(kind)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    noteKind === kind
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50"
                  )}>
                  {kind}
                </button>
              ))}
            </div>
            <Textarea
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              placeholder="What happened?"
              rows={4}
              className="resize-y"
            />
            <Button type="submit" size="sm" disabled={!noteBody.trim()}>
              Save to timeline
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 && activities.length === 0 ? (
            <CustomerTabEmptyState icon={MessageSquare} embedded>
              <p>Nothing logged yet.</p>
              <p>Saved entries appear in this timeline below the add form.</p>
            </CustomerTabEmptyState>
          ) : (
            <ul className="space-y-4">
              {[...notes]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((note) => (
                  <li key={note.id} className="border-border/50 bg-background/40 rounded-xl border p-4">
                    <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="capitalize">{note.kind}</span>
                      <time dateTime={new Date(note.createdAt).toISOString()}>
                        {new Date(note.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-foreground">{note.body}</p>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
