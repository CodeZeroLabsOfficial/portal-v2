"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TaskDatePickerProps {
  id?: string;
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

/** Date-only picker matching the UI kit todo add/edit sheet. */
export function TaskDatePicker({
  id,
  label,
  date,
  onDateChange,
  disabled
}: TaskDatePickerProps) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}>
            <CalendarIcon className="size-4" />
            {date ? format(date, "PPP") : "Select a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            disabled={{ before: startOfToday }}
            selected={date}
            onSelect={onDateChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
