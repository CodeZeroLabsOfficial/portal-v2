"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Check, EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  readSelectFilter,
  SELECT_FILTER_OPERATORS,
  selectFilterOperator,
  type SelectFilterOperator
} from "@/lib/crm/table-filters";
import { cn } from "@/lib/utils";

export interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: FacetedFilterOption[];
  /** Opens the condition list as soon as the chip is added. */
  defaultOpen?: boolean;
  onAutoOpenHandled?: () => void;
  onRemove?: () => void;
}

const segmentClassName =
  "h-7 bg-background px-2.5 text-[0.8rem] font-normal shadow-none dark:bg-input/30";

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  defaultOpen = false,
  onAutoOpenHandled,
  onRemove
}: DataTableFacetedFilterProps<TData, TValue>) {
  const filter = readSelectFilter(column?.getFilterValue());
  const operator = filter?.operator ?? null;
  const selectedValues = filter?.values ?? [];
  const operatorMeta = selectFilterOperator(operator);
  const needsValue = operatorMeta != null && operatorMeta.arity !== "none";
  const singleValue = operatorMeta?.arity === "one";
  const [conditionOpen, setConditionOpen] = React.useState(defaultOpen);
  const [valueOpen, setValueOpen] = React.useState(false);
  const facets = column?.getFacetedUniqueValues();
  const picked = options.filter((option) => selectedValues.includes(option.value));

  function writeFilter(nextOperator: SelectFilterOperator, values: string[]) {
    column?.setFilterValue({ operator: nextOperator, values });
  }

  function handleConditionOpenChange(open: boolean) {
    setConditionOpen(open);
    if (!open) onAutoOpenHandled?.();
  }

  function chooseOperator(next: SelectFilterOperator) {
    const nextMeta = selectFilterOperator(next);
    const nextValues =
      nextMeta?.arity === "none"
        ? []
        : nextMeta?.arity === "one"
          ? selectedValues.slice(0, 1)
          : selectedValues;
    writeFilter(next, nextValues);
    setConditionOpen(false);
    if (nextMeta && nextMeta.arity !== "none") {
      // Wait until the condition menu has released focus, or the value list closes immediately.
      window.setTimeout(() => setValueOpen(true), 0);
    }
  }

  function toggleValue(value: string) {
    if (!operator) return;
    if (singleValue) {
      writeFilter(operator, selectedValues[0] === value ? [] : [value]);
      setValueOpen(false);
      return;
    }
    const next = new Set(selectedValues);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    writeFilter(operator, Array.from(next));
  }

  function handleRemove() {
    column?.setFilterValue(undefined);
    onRemove?.();
  }

  return (
    <ButtonGroup aria-label={title ? `${title} filter` : "Filter"}>
      <ButtonGroupText className={cn(segmentClassName, "cursor-default gap-1.5")}>
        {title}
      </ButtonGroupText>
      <DropdownMenu open={conditionOpen} onOpenChange={handleConditionOpenChange}>
        <DropdownMenuTrigger asChild>
          <ButtonGroupText
            asChild
            className={cn(
              segmentClassName,
              "cursor-default hover:bg-accent",
              operator ? "text-muted-foreground" : "text-foreground"
            )}>
            <button type="button">{operatorMeta?.label ?? "Select condition"}</button>
          </ButtonGroupText>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {SELECT_FILTER_OPERATORS.map((entry) => (
            <DropdownMenuItem key={entry.value} onSelect={() => chooseOperator(entry.value)}>
              {entry.label}
              {entry.value === operator ? <Check className="ml-auto size-4" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {needsValue ? (
        <Popover open={valueOpen} onOpenChange={setValueOpen}>
          <PopoverTrigger asChild>
            <ButtonGroupText
              asChild
              className={cn(
                segmentClassName,
                "cursor-default hover:bg-accent",
                picked.length === 0 && "text-muted-foreground"
              )}>
              <button type="button">{valueLabel(picked)}</button>
            </ButtonGroupText>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder={title} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem key={option.value} onSelect={() => toggleValue(option.value)}>
                        <div
                          className={cn(
                            "flex size-4 items-center justify-center rounded-[4px] border",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input [&_svg]:invisible"
                          )}>
                          <Check className="size-3.5 text-primary-foreground" />
                        </div>
                        {option.icon ? (
                          <option.icon className="text-muted-foreground size-4" />
                        ) : null}
                        <span>{option.label}</span>
                        {facets?.get(option.value) ? (
                          <span className="text-muted-foreground ml-auto flex size-4 items-center justify-center font-mono text-xs">
                            {facets.get(option.value)}
                          </span>
                        ) : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedValues.length > 0 && operator ? (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => writeFilter(operator, [])}
                        className="justify-center text-center">
                        Clear
                      </CommandItem>
                    </CommandGroup>
                  </>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="bg-background dark:bg-input/30"
            aria-label={title ? `${title} filter options` : "Filter options"}>
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleRemove}>Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}

function valueLabel(picked: FacetedFilterOption[]): React.ReactNode {
  if (picked.length === 0) return "Select";
  if (picked.length === 1) {
    const option = picked[0];
    const Icon = option.icon;
    return (
      <span className="flex items-center gap-1.5">
        {Icon ? <Icon className="size-3.5" /> : null}
        {option.label}
      </span>
    );
  }
  return String(picked.length);
}
