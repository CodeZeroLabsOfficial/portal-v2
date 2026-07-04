"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { listTaskAssigneeOptionsAction } from "@/server/actions/tasks-crm";

const UNASSIGNED_VALUE = "__unassigned__";

export interface TaskAssigneeFieldProps {
  id?: string;
  value: string;
  onValueChange: (uid: string) => void;
  disabled?: boolean;
  allowUnassigned?: boolean;
  /** Shown on the removable badge before options load (e.g. from hydrated task). */
  displayNameHint?: string;
}

/** Kit-style assignee field: removable outline badge + staff select. */
export function TaskAssigneeField({
  id = "task-assignee",
  value,
  onValueChange,
  disabled,
  allowUnassigned,
  displayNameHint
}: TaskAssigneeFieldProps) {
  const [options, setOptions] = React.useState<
    Array<{ uid: string; displayName: string; email: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);

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

  const selectedOption = options.find((o) => o.uid === value);
  const badgeLabel = selectedOption?.displayName ?? displayNameHint;

  function handleSelectChange(next: string) {
    onValueChange(next === UNASSIGNED_VALUE ? "" : next);
  }

  const selectValue = value || (allowUnassigned ? UNASSIGNED_VALUE : "");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Assigned To</Label>
      {value && badgeLabel ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer gap-1 font-normal"
            onClick={() => !disabled && onValueChange("")}>
            {badgeLabel}
            <X className="size-3" />
          </Badge>
        </div>
      ) : null}
      <Select
        value={selectValue}
        onValueChange={handleSelectChange}
        disabled={disabled || loading || (!allowUnassigned && options.length === 0)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue
            placeholder={
              loading
                ? "Loading users…"
                : options.length === 0
                  ? "No assignable users"
                  : "Select assignee"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {allowUnassigned ? (
            <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
          ) : null}
          {options.map((opt) => (
            <SelectItem key={opt.uid} value={opt.uid}>
              {opt.displayName}
              {opt.email ? ` (${opt.email})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
