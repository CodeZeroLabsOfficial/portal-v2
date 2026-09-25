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
  /** Opens the value list as soon as the chip is added. */
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
  const [valueOpen, setValueOpen] = React.useState(defaultOpen);

  function handleValueOpenChange(open: boolean) {
    setValueOpen(open);
    if (!open) onAutoOpenHandled?.();
  }
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const picked = options.filter((option) => selectedValues.has(option.value));

  function setSelected(next: string[]) {
    column?.setFilterValue(next.length ? next : undefined);
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
      {/* These filters are multi-select only, so the operator is not editable. */}
      <ButtonGroupText className={cn(segmentClassName, "cursor-default text-muted-foreground")}>
        is any of
      </ButtonGroupText>
      <Popover open={valueOpen} onOpenChange={handleValueOpenChange}>
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
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        const next = new Set(selectedValues);
                        if (isSelected) next.delete(option.value);
                        else next.add(option.value);
                        setSelected(Array.from(next));
                      }}>
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[4px] border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input [&_svg]:invisible"
                        )}>
                        <Check className="size-3.5 text-primary-foreground" />
                      </div>
                      {option.icon ? <option.icon className="text-muted-foreground size-4" /> : null}
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
              {selectedValues.size > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => column?.setFilterValue(undefined)}
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
