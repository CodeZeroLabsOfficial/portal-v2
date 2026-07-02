"use client";

import * as React from "react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  startOfYear,
  startOfWeek
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const ALL_TIME_PRESET = "allTime";

const dateFilterPresets = [
  { name: "All time", value: ALL_TIME_PRESET },
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "This Week", value: "thisWeek" },
  { name: "Last 7 Days", value: "last7Days" },
  { name: "Last 28 Days", value: "last28Days" },
  { name: "This Month", value: "thisMonth" },
  { name: "Last Month", value: "lastMonth" },
  { name: "This Year", value: "thisYear" }
];

function defaultUncontrolledRange(): DateRange {
  const today = new Date();
  const twentyEightDaysAgo = startOfDay(subDays(today, 27));
  return { from: twentyEightDaysAgo, to: endOfDay(today) };
}

export interface CalendarDateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

export default function CalendarDateRangePicker({
  className,
  value: controlledValue,
  onChange
}: CalendarDateRangePickerProps) {
  const isMobile = useIsMobile();
  const isControlled = onChange !== undefined;
  const [uncontrolledDate, setUncontrolledDate] = React.useState<DateRange | undefined>(() =>
    defaultUncontrolledRange()
  );
  const date = isControlled ? controlledValue : uncontrolledDate;

  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [activePreset, setActivePreset] = React.useState(
    isControlled ? ALL_TIME_PRESET : "last28Days"
  );

  React.useEffect(() => {
    if (!isControlled) return;
    setActivePreset(controlledValue?.from ? "" : ALL_TIME_PRESET);
  }, [isControlled, controlledValue]);

  function applyRange(next: DateRange | undefined, preset: string) {
    setActivePreset(preset);
    if (isControlled) {
      onChange(next);
    } else {
      setUncontrolledDate(next);
    }
  }

  const handleQuickSelect = (from: Date, to: Date, preset: string) => {
    applyRange({ from, to }, preset);
    setCurrentMonth(from);
  };

  const changeHandle = (type: string) => {
    if (type === ALL_TIME_PRESET) {
      applyRange(undefined, ALL_TIME_PRESET);
      return;
    }

    const today = new Date();

    switch (type) {
      case "today":
        handleQuickSelect(startOfDay(today), endOfDay(today), type);
        break;
      case "yesterday": {
        const yesterday = subDays(today, 1);
        handleQuickSelect(startOfDay(yesterday), endOfDay(yesterday), type);
        break;
      }
      case "thisWeek": {
        const startOfCurrentWeek = startOfWeek(today);
        handleQuickSelect(startOfDay(startOfCurrentWeek), endOfDay(today), type);
        break;
      }
      case "last7Days": {
        const sevenDaysAgo = subDays(today, 6);
        handleQuickSelect(startOfDay(sevenDaysAgo), endOfDay(today), type);
        break;
      }
      case "last28Days": {
        const twentyEightDaysAgo = subDays(today, 27);
        handleQuickSelect(startOfDay(twentyEightDaysAgo), endOfDay(today), type);
        break;
      }
      case "thisMonth":
        handleQuickSelect(startOfMonth(today), endOfDay(today), type);
        break;
      case "lastMonth": {
        const lastMonth = subMonths(today, 1);
        handleQuickSelect(startOfMonth(lastMonth), endOfMonth(lastMonth), type);
        break;
      }
      case "thisYear": {
        const startOfCurrentYear = startOfYear(today);
        handleQuickSelect(startOfDay(startOfCurrentYear), endOfDay(today), type);
        break;
      }
    }
  };

  const triggerLabel = date?.from ? (
    date.to ? (
      <>
        {format(date.from, "dd MMM yyyy")} - {format(date.to, "dd MMM yyyy")}
      </>
    ) : (
      format(date.from, "dd MMM yyyy")
    )
  ) : (
    <span>All time</span>
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {isMobile ? (
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date?.from && "text-muted-foreground"
                      )}>
                      <CalendarIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{triggerLabel}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <Button
              id="date"
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date?.from && "text-muted-foreground"
              )}>
              <CalendarIcon />
              {triggerLabel}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="end">
          <div className="flex flex-col lg:flex-row">
            <div className="me-0 lg:me-4">
              <ToggleGroup
                type="single"
                value={activePreset}
                className="hidden w-28 flex-col lg:block">
                {dateFilterPresets.map((item) => (
                  <ToggleGroupItem
                    key={item.value}
                    className="text-muted-foreground w-full"
                    value={item.value}
                    onClick={() => changeHandle(item.value)}
                    asChild>
                    <Button className="justify-start rounded-md">{item.name}</Button>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Select value={activePreset} onValueChange={(value) => changeHandle(value)}>
                <SelectTrigger
                  className="mb-4 flex w-full lg:hidden"
                  size="sm"
                  aria-label="Select a value">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilterPresets.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              className="border-s-0 py-0! ps-0! pe-0! lg:border-s lg:ps-4!"
              mode="range"
              month={currentMonth}
              selected={date}
              onSelect={(newDate) => {
                if (isControlled) {
                  onChange(newDate);
                } else {
                  setUncontrolledDate(newDate);
                }
                setActivePreset("");
                if (newDate?.from) {
                  setCurrentMonth(newDate.from);
                }
              }}
              onMonthChange={setCurrentMonth}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
