"use client";

import * as React from "react";
import { Check, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface EditableTemplateNameControlProps {
  value: string;
  emptyLabel: string;
  editing: boolean;
  saving: boolean;
  onChange: (name: string) => void;
  onStartEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  /** compact: width-capped inline title; standalone: builder top bar title */
  appearance?: "compact" | "standalone";
  placeholder?: string;
  className?: string;
}

export function EditableTemplateNameControl({
  value,
  emptyLabel,
  editing,
  saving,
  onChange,
  onStartEdit,
  onConfirm,
  onCancel,
  appearance = "compact",
  placeholder = "Template name",
  className,
}: EditableTemplateNameControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayLabel = value.trim() || emptyLabel;
  const isCompact = appearance === "compact";

  React.useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  if (editing) {
    return (
      <div
        className={cn(
          "inline-flex min-w-0 items-center gap-1",
          isCompact
            ? "min-w-[20rem] w-[min(36rem,calc(100vw-18rem))] sm:min-w-[28rem]"
            : "min-w-[10rem] w-[min(36rem,calc(100vw-18rem))] sm:min-w-[28rem]",
          className,
        )}
      >
        <Input
          ref={inputRef}
          aria-label="Template name"
          value={value}
          disabled={saving}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirm();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          className={cn(
            "min-w-0 flex-1 shadow-none focus-visible:ring-2 focus-visible:ring-ring",
            isCompact
              ? "h-8 rounded-md border border-border/80 bg-muted/30 px-2.5 text-sm font-normal text-foreground"
              : "h-8 border-0 bg-transparent px-0 text-xs font-medium text-foreground",
          )}
        />
        <Button
          type="button"
          size="icon-sm"
          className="size-7 shrink-0"
          disabled={saving}
          aria-label="Save template name"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onConfirm}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Check className="size-3.5" aria-hidden />
          )}
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={saving}
      aria-label="Edit template name"
      onClick={onStartEdit}
      className={cn(
        "group/template-name inline-flex min-w-0 items-center gap-1.5 rounded-sm text-left outline-none ring-offset-background transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isCompact
          ? "max-w-[12rem] text-sm font-normal text-foreground sm:max-w-xs"
          : "h-8 max-w-full text-xs font-medium text-foreground",
        className,
      )}
    >
      <span className={cn("min-w-0 truncate", !value.trim() && "text-muted-foreground")}>{displayLabel}</span>
      <Pencil
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground transition-opacity",
          "opacity-0 group-hover/template-name:opacity-100 group-focus-visible/template-name:opacity-100",
        )}
        aria-hidden
      />
    </button>
  );
}
