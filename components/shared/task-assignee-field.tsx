"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { listTaskAssigneeOptionsAction } from "@/server/actions/tasks-crm";

export interface TaskAssigneeFieldProps {
  id?: string;
  value: string;
  onValueChange: (uid: string) => void;
  disabled?: boolean;
  allowUnassigned?: boolean;
  /** Shown on the removable badge before options load (e.g. from hydrated task). */
  displayNameHint?: string;
}

type AssigneeOption = { uid: string; displayName: string; email: string };

function filterAssigneeOptions(options: AssigneeOption[], query: string): AssigneeOption[] {
  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? options.filter(
        (opt) =>
          opt.displayName.toLowerCase().includes(normalized) ||
          opt.email.toLowerCase().includes(normalized)
      )
    : options;
  return matches.slice(0, 8);
}

function findAssigneeMatch(query: string, options: AssigneeOption[]): AssigneeOption | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const exact = options.find(
    (opt) =>
      opt.displayName.toLowerCase() === normalized || opt.email.toLowerCase() === normalized
  );
  if (exact) return exact;

  const partial = filterAssigneeOptions(options, query);
  return partial.length === 1 ? partial[0] : undefined;
}

/** Kit-style assignee field: input with suggestions + add button, badge below when set. */
export function TaskAssigneeField({
  id = "task-assignee",
  value,
  onValueChange,
  disabled,
  displayNameHint
}: TaskAssigneeFieldProps) {
  const [options, setOptions] = React.useState<AssigneeOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listTaskAssigneeOptionsAction().then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) setOptions(res.options);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!value) setSearchQuery("");
  }, [value]);

  const filteredOptions = React.useMemo(
    () => filterAssigneeOptions(options, searchQuery),
    [options, searchQuery]
  );

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [searchQuery, filteredOptions.length]);

  const selectedOption = options.find((o) => o.uid === value);
  const badgeLabel = selectedOption?.displayName ?? displayNameHint;

  function selectAssignee(opt: AssigneeOption) {
    onValueChange(opt.uid);
    setSearchQuery("");
    setSuggestionsOpen(false);
  }

  function handleAddAssignee() {
    if (disabled || loading) return;
    const highlighted = filteredOptions[highlightIndex];
    if (highlighted && suggestionsOpen) {
      selectAssignee(highlighted);
      return;
    }
    const match = findAssigneeMatch(searchQuery, options);
    if (!match) return;
    selectAssignee(match);
  }

  function handleRemoveAssignee() {
    if (disabled) return;
    onValueChange("");
    setSearchQuery("");
    setSuggestionsOpen(false);
  }

  const inputDisabled = disabled || loading || options.length === 0;
  const showSuggestions = suggestionsOpen && filteredOptions.length > 0 && !inputDisabled;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Assigned To</Label>

      <Popover open={showSuggestions} onOpenChange={setSuggestionsOpen}>
        <PopoverAnchor asChild>
          <div className="flex items-center gap-2">
            <Input
              id={id}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              placeholder={
                loading
                  ? "Loading users…"
                  : options.length === 0
                    ? "No assignable users"
                    : "Enter user name"
              }
              disabled={inputDisabled}
              autoComplete="off"
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSuggestionsOpen(true);
                  setHighlightIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIndex((i) => Math.max(i - 1, 0));
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setSuggestionsOpen(false);
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAssignee();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={inputDisabled || !searchQuery.trim()}
              onClick={handleAddAssignee}
              aria-label="Add assignee">
              <Plus className="size-4" />
            </Button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-1"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}>
          <ul className="max-h-48 overflow-y-auto">
            {filteredOptions.map((opt, index) => (
              <li key={opt.uid}>
                <button
                  type="button"
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm outline-hidden",
                    index === highlightIndex && "bg-accent text-accent-foreground"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectAssignee(opt)}>
                  <span>{opt.displayName}</span>
                  {opt.email ? (
                    <span className="text-muted-foreground text-xs">{opt.email}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {value && badgeLabel ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer gap-1 font-normal"
            onClick={handleRemoveAssignee}>
            {badgeLabel}
            <X className="size-3" />
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
