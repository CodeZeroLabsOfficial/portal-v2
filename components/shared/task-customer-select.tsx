"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const NONE_VALUE = "__none__";

export interface TaskCustomerOption {
  id: string;
  label: string;
}

export interface TaskCustomerSelectProps {
  id?: string;
  options: TaskCustomerOption[];
  value: string;
  onValueChange: (customerId: string) => void;
  disabled?: boolean;
  /** When set, shows read-only label instead of picker (customer tab create flow). */
  lockedCustomerId?: string;
  label?: string;
}

export function TaskCustomerSelect({
  id = "task-customer",
  options,
  value,
  onValueChange,
  disabled,
  lockedCustomerId,
  label = "Customer"
}: TaskCustomerSelectProps) {
  if (lockedCustomerId) {
    const lockedLabel =
      options.find((o) => o.id === lockedCustomerId)?.label ?? "This customer";
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <p id={id} className="text-muted-foreground text-sm">
          {lockedLabel}
        </p>
      </div>
    );
  }

  const selectValue = value || NONE_VALUE;

  function handleChange(next: string) {
    onValueChange(next === NONE_VALUE ? "" : next);
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={selectValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="No customer linked" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>No customer</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label || opt.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
