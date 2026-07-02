"use client";

import * as React from "react";
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface KanbanBoardToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  /** When set, renders the filter button with an active count badge. */
  activeFilterCount?: number;
  filterContent?: React.ReactNode;
  /** Extra actions rendered after search/filters (e.g. Add task). */
  trailing?: React.ReactNode;
  className?: string;
}

/** Search + optional filter popover row matching the UI kit Kanban toolbar. */
function KanbanBoardToolbar({
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Search…",
  activeFilterCount = 0,
  filterContent,
  trailing,
  className
}: KanbanBoardToolbarProps) {
  const [filterOpen, setFilterOpen] = React.useState(false);

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative hidden w-auto lg:block">
        <SearchIcon className="absolute top-2.5 left-3 size-4 opacity-50" aria-hidden />
        <Input
          placeholder={searchPlaceholder}
          className="ps-8"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>
      <div className="lg:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Search">
              <SearchIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-2" align="end">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {filterContent ? (
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontalIcon />
              <span className="hidden lg:inline">
                {activeFilterCount > 0 ? <>Filters ({activeFilterCount})</> : "Filters"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="end">
            {filterContent}
          </PopoverContent>
        </Popover>
      ) : null}

      {trailing}
    </div>
  );
}

export { KanbanBoardToolbar };
export type { KanbanBoardToolbarProps };
