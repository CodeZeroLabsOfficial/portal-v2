"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function findAssigneeMatch(
  query: string,
  options: Array<{ uid: string; displayName: string; email: string }>
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const exact = options.find(
    (opt) =>
      opt.displayName.toLowerCase() === normalized || opt.email.toLowerCase() === normalized
  );
  if (exact) return exact;

  const partial = options.filter(
    (opt) =>
      opt.displayName.toLowerCase().includes(normalized) ||
      opt.email.toLowerCase().includes(normalized)
  );
  return partial.length === 1 ? partial[0] : undefined;
}

/** Kit-style assignee field: removable outline badge + name input with add button. */
export function TaskAssigneeField({
  id = "task-assignee",
  value,
  onValueChange,
  disabled,
  displayNameHint
}: TaskAssigneeFieldProps) {
  const [options, setOptions] = React.useState<
    Array<{ uid: string; displayName: string; email: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

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

  const selectedOption = options.find((o) => o.uid === value);
  const badgeLabel = selectedOption?.displayName ?? displayNameHint;

  function handleAddAssignee() {
    if (disabled || loading) return;
    const match = findAssigneeMatch(searchQuery, options);
    if (!match) return;
    onValueChange(match.uid);
    setSearchQuery("");
  }

  function handleRemoveAssignee() {
    if (disabled) return;
    onValueChange("");
    setSearchQuery("");
  }

  const inputDisabled = disabled || loading || options.length === 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Assigned To</Label>
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
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            loading
              ? "Loading users…"
              : options.length === 0
                ? "No assignable users"
                : "Enter user name"
          }
          disabled={inputDisabled}
          autoComplete="off"
          onKeyDown={(e) => {
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
    </div>
  );
}
