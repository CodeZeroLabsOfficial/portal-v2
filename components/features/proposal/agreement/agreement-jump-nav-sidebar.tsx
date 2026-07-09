"use client";

import { Button } from "@/components/ui/button";
import { AgreementSectionLabel } from "@/components/features/proposal/agreement/agreement-section-label";
import {
  AGREEMENT_NAV_CHILD_LINK_CLASSES,
  AGREEMENT_NAV_LINK_CLASSES,
} from "@/lib/proposal/agreement/chrome-typography";
import type { AgreementJumpItem } from "@/lib/proposal/agreement/jump-nav";
import { cn } from "@/lib/utils";

export interface AgreementJumpNavSidebarProps {
  open: boolean;
  items: AgreementJumpItem[];
  onJump: (sectionId: string) => void;
}

export function AgreementJumpNavSidebar({ open, items, onJump }: AgreementJumpNavSidebarProps) {
  return (
    <aside
      id="agreement-sections-sidebar"
      aria-hidden={!open}
      inert={!open ? true : undefined}
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r motion-reduce:transition-none print:hidden",
        "transition-[width] duration-300 ease-out",
        open
          ? "w-[min(18rem,88vw)] border-border shadow-[4px_0_16px_-8px_rgba(0,0,0,0.08)]"
          : "w-0 border-transparent",
      )}
    >
      <div className="flex h-full min-h-0 w-[min(18rem,88vw)] flex-col">
        <div className="shrink-0 border-b px-4 py-3">
          <AgreementSectionLabel>Jump to</AgreementSectionLabel>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Agreement sections">
          <ul className="space-y-0.5">
            {items.map((item) =>
              item.kind === "link" ? (
                <li key={item.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className={AGREEMENT_NAV_LINK_CLASSES}
                    onClick={() => onJump(item.id)}
                  >
                    {item.label}
                  </Button>
                </li>
              ) : (
                <li key={item.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className={AGREEMENT_NAV_LINK_CLASSES}
                    onClick={() => onJump(item.id)}
                  >
                    {item.label}
                  </Button>
                  {item.children.length > 0 ? (
                    <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-border pl-1">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Button
                            type="button"
                            variant="ghost"
                            className={AGREEMENT_NAV_CHILD_LINK_CLASSES}
                            onClick={() => onJump(child.id)}
                          >
                            {child.label}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
