"use client";

import type { ProposalBlockViewProps } from "@/lib/proposal/block-view-types";

export function renderFormBlock({ block }: ProposalBlockViewProps): React.ReactNode {
  if (block.type !== "form") return null;
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-foreground">{block.submitLabel ?? "Information"}</p>
      <div className="mt-4 space-y-3">
        {(block.fields ?? []).map((f) => (
          <div key={f.id}>
            <label className="text-[12px] font-medium text-muted-foreground">
              {f.label}
              {f.required ? <span className="text-destructive"> *</span> : null}
            </label>
            {f.fieldType === "textarea" ? (
              <textarea
                disabled
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                placeholder="Collected when you accept"
              />
            ) : f.fieldType === "select" ? (
              <select disabled className="mt-1 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {(f.options ?? ["Option"]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                disabled
                type={f.fieldType === "email" ? "email" : "text"}
                className="mt-1 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                placeholder="Collected when you accept"
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Form responses can be finalized together with your acceptance below.
      </p>
    </div>
  );
}
