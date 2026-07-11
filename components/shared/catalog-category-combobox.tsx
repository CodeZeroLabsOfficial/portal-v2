"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CatalogCategoryOption } from "@/types/catalog-category";

export interface CatalogCategoryComboboxProps {
  id?: string;
  value?: string;
  categories: readonly CatalogCategoryOption[];
  onValueChange: (categoryId: string) => void;
  onCreateCategory: (label: string) => Promise<CatalogCategoryOption | null>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CatalogCategoryCombobox({
  id,
  value,
  categories,
  onValueChange,
  onCreateCategory,
  disabled,
  placeholder = "Select category",
  className,
}: CatalogCategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const selected = categories.find((c) => c.id === value);
  const trimmedQuery = query.trim();
  const queryLower = trimmedQuery.toLowerCase();
  const exactMatch = categories.some(
    (c) => c.label.toLowerCase() === queryLower || c.id === queryLower,
  );
  const canCreate = trimmedQuery.length > 0 && !exactMatch && !creating;

  async function handleCreate() {
    if (!canCreate) return;
    setCreating(true);
    try {
      const created = await onCreateCategory(trimmedQuery);
      if (created) {
        onValueChange(created.id);
        setQuery("");
        setOpen(false);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || creating}
          className={cn(
            "bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground/80 size-4 shrink-0" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter>
          <CommandInput
            placeholder="Find or add category"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={`${category.label} ${category.id}`}
                  onSelect={() => {
                    onValueChange(category.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {category.label}
                  {value === category.id ? (
                    <CheckIcon className="ml-auto size-4" aria-hidden />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {canCreate ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value={`create-${trimmedQuery}`}
                    onSelect={() => void handleCreate()}
                    disabled={creating}
                  >
                    <PlusIcon className="opacity-60" aria-hidden />
                    {creating ? "Creating…" : `Create “${trimmedQuery}”`}
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
