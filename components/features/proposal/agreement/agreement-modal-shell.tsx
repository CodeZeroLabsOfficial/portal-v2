"use client";

import * as React from "react";
import { Download, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AgreementJumpNavSidebar } from "@/components/features/proposal/agreement/agreement-jump-nav-sidebar";
import { useAgreementPrintMode } from "@/hooks/use-agreement-print-mode";
import { AGREEMENT_MODAL_HEADER_TITLE_CLASSES } from "@/lib/proposal/agreement/chrome-typography";
import type { AgreementJumpItem } from "@/lib/proposal/agreement/jump-nav";
import { jumpToAgreementSection } from "@/lib/proposal/agreement/jump-nav";
import { AGREEMENT_MODAL_DIALOG_CONTENT_CLASSES } from "@/lib/proposal/agreement/modal-layout";

export interface AgreementModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementTitle: string;
  jumpNavItems: AgreementJumpItem[];
  onDownload: () => void;
  headerActions?: React.ReactNode;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  closeLabel?: string;
  children: React.ReactNode;
}

export function AgreementModalShell({
  open,
  onOpenChange,
  agreementTitle,
  jumpNavItems,
  onDownload,
  headerActions,
  scrollContainerRef,
  closeLabel = "Close agreement",
  children,
}: AgreementModalShellProps) {
  const internalScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [sectionsSidebarOpen, setSectionsSidebarOpen] = React.useState(false);

  useAgreementPrintMode();

  React.useEffect(() => {
    if (!open) setSectionsSidebarOpen(false);
  }, [open]);

  const setScrollContainerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      internalScrollRef.current = node;
      if (scrollContainerRef) {
        scrollContainerRef.current = node;
      }
    },
    [scrollContainerRef],
  );

  function jumpToSection(sectionId: string) {
    jumpToAgreementSection(internalScrollRef.current, sectionId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => {
          if (sectionsSidebarOpen) {
            e.preventDefault();
            setSectionsSidebarOpen(false);
          }
        }}
        className={AGREEMENT_MODAL_DIALOG_CONTENT_CLASSES}
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={sectionsSidebarOpen ? "Close agreement sections" : "Open agreement sections"}
              aria-expanded={sectionsSidebarOpen}
              aria-controls="agreement-sections-sidebar"
              onClick={() => setSectionsSidebarOpen((v) => !v)}
            >
              <Menu className="size-5" aria-hidden />
            </Button>
            <DialogTitle className={AGREEMENT_MODAL_HEADER_TITLE_CLASSES}>{agreementTitle}</DialogTitle>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="aspect-square max-sm:p-0"
            >
              <Download aria-hidden className="opacity-60 sm:-ms-1" size={16} />
              <span className="max-sm:sr-only">Download</span>
            </Button>
            {headerActions}
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={closeLabel}>
                <X className="size-5" aria-hidden />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-1 overflow-hidden print:block print:h-auto print:min-h-0 print:overflow-visible">
          <AgreementJumpNavSidebar
            open={sectionsSidebarOpen}
            items={jumpNavItems}
            onJump={jumpToSection}
          />
          <div
            ref={setScrollContainerRef}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] print:overflow-visible print:pb-0"
          >
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
