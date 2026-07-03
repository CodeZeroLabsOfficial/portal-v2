"use client";

import { Plus } from "lucide-react";

import type { BlockEditorProps } from "@/components/features/proposal/blocks/block-editor-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormBlock, FormField } from "@/types/proposal";

function newFieldId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `f-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function FormBlockEditor({ block, onChange }: BlockEditorProps<FormBlock>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Submit label</Label>
        <Input
          value={block.submitLabel ?? ""}
          onChange={(e) => onChange({ ...block, submitLabel: e.target.value })}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() =>
          onChange({
            ...block,
            fields: [
              ...block.fields,
              { id: newFieldId(), label: "New field", fieldType: "text", required: false },
            ],
          })
        }
      >
        <Plus className="h-3.5 w-3.5" /> Add field
      </Button>
      {block.fields.map((f, idx) => (
        <div key={f.id} className="grid gap-2 rounded-lg border border-border/50 p-3 sm:grid-cols-2">
          <Input
            value={f.label}
            onChange={(e) => {
              const fields = [...block.fields];
              fields[idx] = { ...f, label: e.target.value };
              onChange({ ...block, fields });
            }}
          />
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={f.fieldType}
            onChange={(e) => {
              const fields = [...block.fields] as FormField[];
              fields[idx] = { ...f, fieldType: e.target.value as FormField["fieldType"] };
              onChange({ ...block, fields });
            }}
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="textarea">Paragraph</option>
            <option value="select">Select</option>
          </select>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(f.required)}
              onChange={(e) => {
                const fields = [...block.fields];
                fields[idx] = { ...f, required: e.target.checked };
                onChange({ ...block, fields });
              }}
            />
            Required
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive sm:col-span-2"
            onClick={() => onChange({ ...block, fields: block.fields.filter((x) => x.id !== f.id) })}
          >
            Remove field
          </Button>
        </div>
      ))}
    </div>
  );
}
