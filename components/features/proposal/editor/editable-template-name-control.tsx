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
  /** Breadcrumb last crumb vs legacy standalone title row. */
  appearance?: "breadcrumb" | "standalone";
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
  appearance = "breadcrumb",
  placeholder = "Template name",
  className,
}: EditableTemplateNameControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayLabel = value.trim() || emptyLabel;
  const isBreadcrumb = appearance === "breadcrumb";

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
          isBreadcrumb ? "max-w-[14rem] sm:max-w-md" : "w-full min-w-[10rem] flex-1",
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
            isBreadcrumb
              ? "h-7 border-0 bg-transparent px-0 text-sm font-normal text-foreground"
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
      {...(isBreadcrumb ? { "aria-current": "page" as const } : {})}
      onClick={onStartEdit}
      className={cn(
        "group/template-name inline-flex min-w-0 items-center gap-1.5 rounded-sm text-left outline-none ring-offset-background transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isBreadcrumb
          ? "max-w-[12rem] text-sm font-normal text-foreground sm:max-w-xs"
          : "h-8 w-full flex-1 text-xs font-medium text-foreground",
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
