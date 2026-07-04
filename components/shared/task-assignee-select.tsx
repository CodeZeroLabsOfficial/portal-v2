"use client";

import * as React from "react";

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

export interface TaskAssigneeSelectProps {
  id?: string;
  value: string;
  onValueChange: (uid: string) => void;
  disabled?: boolean;
  allowUnassigned?: boolean;
  label?: string;
}

export function TaskAssigneeSelect({
  id = "task-assignee",
  value,
  onValueChange,
  disabled,
  allowUnassigned,
  label = "Assign to"
}: TaskAssigneeSelectProps) {
  const [options, setOptions] = React.useState<
    Array<{ uid: string; displayName: string; email: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listTaskAssigneeOptionsAction().then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setLoadError(res.message);
        setOptions([]);
        return;
      }
      setLoadError(null);
      setOptions(res.options);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectValue = value || (allowUnassigned ? UNASSIGNED_VALUE : "");

  function handleChange(next: string) {
    onValueChange(next === UNASSIGNED_VALUE ? "" : next);
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={disabled || loading || (!allowUnassigned && options.length === 0)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue
            placeholder={
              loading
                ? "Loading users…"
                : loadError
                  ? "Failed to load users"
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
