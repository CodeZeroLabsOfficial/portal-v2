"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  CUSTOMER_TAG_OPTIONS,
  MAX_CUSTOMER_TAGS,
  customerTagKey,
  normalizeCustomerTag,
  type CustomerTagOption
} from "@/lib/customer/tags";
import { cn } from "@/lib/utils";

export interface CustomerTagsFieldProps {
  id?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

type TagSuggestion =
  { kind: "catalog"; label: string; color: string } | { kind: "custom"; label: string };

function catalogMatches(query: string, selected: Set<string>): CustomerTagOption[] {
  const normalized = query.trim().toLowerCase();
  return CUSTOMER_TAG_OPTIONS.filter((option) => {
    if (selected.has(customerTagKey(option.label))) return false;
    if (!normalized) return true;
    return option.label.toLowerCase().includes(normalized);
  });
}

function buildSuggestions(query: string, selected: Set<string>): TagSuggestion[] {
  const suggestions: TagSuggestion[] = catalogMatches(query, selected).map((option) => ({
    kind: "catalog",
    label: option.label,
    color: option.color
  }));

  const custom = normalizeCustomerTag(query);
  if (!custom || selected.has(customerTagKey(custom))) return suggestions;

  const exactCatalog = CUSTOMER_TAG_OPTIONS.some(
    (option) => customerTagKey(option.label) === customerTagKey(custom)
  );
  if (!exactCatalog) {
    suggestions.push({ kind: "custom", label: custom });
  }

  return suggestions;
}

export function CustomerTagsField({
  id = "crm-tags",
  tags,
  onTagsChange,
  disabled
}: CustomerTagsFieldProps) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  const atLimit = tags.length >= MAX_CUSTOMER_TAGS;
  const selectedKeys = React.useMemo(() => new Set(tags.map((tag) => customerTagKey(tag))), [tags]);
  const suggestions = React.useMemo(
    () => buildSuggestions(searchQuery, selectedKeys),
    [searchQuery, selectedKeys]
  );

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [searchQuery, suggestions.length]);

  function addTag(label: string) {
    const normalized = normalizeCustomerTag(label);
    if (!normalized || disabled || atLimit) return;
    if (selectedKeys.has(customerTagKey(normalized))) return;
    onTagsChange([...tags, normalized]);
    setSearchQuery("");
    setSuggestionsOpen(false);
  }

  function tagFromQuery(): string | null {
    if (disabled || atLimit) return null;
    const highlighted = suggestionsOpen ? suggestions[highlightIndex] : undefined;
    if (highlighted) return highlighted.label;
    const query = searchQuery.trim();
    if (!query) return null;
    const matches = catalogMatches(query, selectedKeys);
    const exact = CUSTOMER_TAG_OPTIONS.find(
      (option) => customerTagKey(option.label) === customerTagKey(query)
    );
    if (exact) return selectedKeys.has(customerTagKey(exact.label)) ? null : exact.label;
    if (matches.length === 1) return matches[0].label;
    const custom = normalizeCustomerTag(query);
    if (!custom || selectedKeys.has(customerTagKey(custom))) return null;
    return custom;
  }

  function handleAddTag() {
    const next = tagFromQuery();
    if (!next) return;
    addTag(next);
  }

  function handleRemoveTag(tag: string) {
    if (disabled) return;
    const key = customerTagKey(tag);
    onTagsChange(tags.filter((item) => customerTagKey(item) !== key));
  }

  const inputDisabled = disabled || atLimit;
  const showSuggestions = suggestionsOpen && suggestions.length > 0 && !inputDisabled;

  function isInsideAnchor(event: { target: EventTarget | null }) {
    return event.target instanceof Node && Boolean(anchorRef.current?.contains(event.target));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Tags</Label>

      <Popover modal={false} open={showSuggestions} onOpenChange={setSuggestionsOpen}>
        <PopoverAnchor asChild>
          <div ref={anchorRef} className="flex items-center gap-2">
            <Input
              id={id}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSuggestionsOpen(true);
              }}
              placeholder={atLimit ? "Tag limit reached" : "Search tags"}
              disabled={inputDisabled}
              autoComplete="off"
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSuggestionsOpen(true);
                  setHighlightIndex((index) =>
                    Math.min(index + 1, Math.max(suggestions.length - 1, 0))
                  );
                  return;
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlightIndex((index) => Math.max(index - 1, 0));
                  return;
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setSuggestionsOpen(false);
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={inputDisabled || !searchQuery.trim() || !tagFromQuery()}
              onClick={handleAddTag}
              aria-label="Add tag"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-1"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            if (isInsideAnchor(event)) event.preventDefault();
          }}
          onFocusOutside={(event) => {
            if (isInsideAnchor(event)) event.preventDefault();
          }}
        >
          <ul className="max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.kind}-${suggestion.label}`}>
                <button
                  type="button"
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden",
                    index === highlightIndex && "bg-accent text-accent-foreground"
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => addTag(suggestion.label)}
                >
                  {suggestion.kind === "catalog" ? (
                    <span
                      className={cn("size-3 shrink-0 rounded-full", suggestion.color)}
                      aria-hidden
                    />
                  ) : (
                    <Plus className="text-muted-foreground size-3 shrink-0" aria-hidden />
                  )}
                  <span>
                    {suggestion.kind === "custom" ? `Add "${suggestion.label}"` : suggestion.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge
              key={customerTagKey(tag)}
              variant="outline"
              className="cursor-pointer gap-1 font-normal"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className="size-3" />
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
