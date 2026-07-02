"use client";

import * as React from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface InlineEditableFieldProps {
  fieldId: string;
  activeFieldId: string | null;
  onActiveFieldIdChange: (fieldId: string | null) => void;
  value: string;
  onSave: (value: string) => Promise<{ ok: boolean; message?: string }>;
  disabled?: boolean;
  editLabel: string;
  placeholder?: string;
  emptyDisplay?: string;
  multiline?: boolean;
  inputType?: "text" | "number";
  inputMin?: number;
  inputMax?: number;
  className?: string;
}

const viewBoxClass =
  "group/inline flex min-h-9 w-full items-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-sm text-foreground transition-colors";
const viewBoxHoverClass =
  "hover:border-border hover:bg-muted/25 focus-within:border-border focus-within:bg-muted/25";
const editInputClass =
  "h-9 flex-1 shadow-none focus-visible:ring-2 focus-visible:ring-ring";

export function InlineEditableField({
  fieldId,
  activeFieldId,
  onActiveFieldIdChange,
  value,
  onSave,
  disabled = false,
  editLabel,
  placeholder,
  emptyDisplay = "—",
  multiline = false,
  inputType = "text",
  inputMin = 0,
  inputMax,
  className
}: InlineEditableFieldProps) {
  const [draft, setDraft] = React.useState(value);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isEditing = activeFieldId === fieldId;

  React.useEffect(() => {
    if (!isEditing) {
      setDraft(value);
      setError(null);
    }
  }, [isEditing, value]);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      if (inputRef.current && "select" in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  function startEditing() {
    if (disabled || saving) return;
    setDraft(value);
    setError(null);
    onActiveFieldIdChange(fieldId);
  }

  function cancelEditing() {
    setDraft(value);
    setError(null);
    onActiveFieldIdChange(null);
  }

  async function confirmEditing() {
    if (saving) return;
    setSaving(true);
    setError(null);
    const res = await onSave(draft);
    setSaving(false);
    if (!res.ok) {
      setError(res.message ?? "Could not save.");
      return;
    }
    onActiveFieldIdChange(null);
  }

  const displayText = value.trim() ? value.trim() : emptyDisplay;
  const isEmpty = !value.trim();

  if (disabled) {
    return (
      <p className={cn("text-sm text-foreground", isEmpty && "text-muted-foreground", className)}>
        {displayText}
      </p>
    );
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-start gap-1.5">
          {multiline ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              rows={3}
              disabled={saving}
              placeholder={placeholder}
              aria-label={editLabel}
              className="min-h-[5rem] flex-1 resize-y"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEditing();
                }
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void confirmEditing();
                }
              }}
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={inputType}
              min={inputType === "number" ? inputMin : undefined}
              max={inputType === "number" ? inputMax : undefined}
              value={draft}
              disabled={saving}
              placeholder={placeholder}
              aria-label={editLabel}
              className={editInputClass}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void confirmEditing();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEditing();
                }
              }}
            />
          )}
          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            <Button
              type="button"
              size="icon"
              className="size-8 shrink-0"
              disabled={saving}
              aria-label={`Save ${editLabel}`}
              onClick={() => void confirmEditing()}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              disabled={saving}
              aria-label={`Cancel editing ${editLabel}`}
              onClick={cancelEditing}>
              <X className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div
        role="button"
        tabIndex={0}
        className={cn(viewBoxClass, viewBoxHoverClass, "cursor-text")}
        onClick={startEditing}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startEditing();
          }
        }}>
        <span
          className={cn(
            "min-w-0 flex-1",
            !multiline && "truncate",
            isEmpty && "text-muted-foreground",
            multiline && !isEmpty && "whitespace-pre-wrap"
          )}>
          {displayText}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 opacity-0 transition-opacity group-hover/inline:opacity-100 group-focus-within/inline:opacity-100"
          aria-label={`Edit ${editLabel}`}
          onClick={(e) => {
            e.stopPropagation();
            startEditing();
          }}>
          <Pencil className="text-muted-foreground size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
