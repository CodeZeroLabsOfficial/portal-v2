"use client";

import * as React from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { GripVertical } from "lucide-react";

import { useResolvedProposalToolbarAppearance } from "@/components/proposal/proposal-section-editor-chrome";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type ProposalToolbarAppearance,
  PROPOSAL_TOOLBAR_TOKENS,
  proposalToolbarIconButtonClasses,
  proposalToolbarMenuItemClasses,
  proposalToolbarMenuItemHoverClasses,
  proposalToolbarSectionLabelClasses,
  proposalToolbarShellClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";

export interface ProposalToolbarShellProps extends React.ComponentProps<"div"> {
  appearance?: ProposalToolbarAppearance;
}

export function ProposalToolbarShell({
  appearance: appearanceProp,
  className,
  children,
  ...props
}: ProposalToolbarShellProps) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1 py-0.5",
        proposalToolbarShellClasses(appearance),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ProposalToolbarIconButtonProps extends ButtonProps {
  appearance?: ProposalToolbarAppearance;
  active?: boolean;
  tooltip?: React.ReactNode;
  tooltipShortcut?: string;
}

export function ProposalToolbarIconButton({
  appearance: appearanceProp,
  active,
  tooltip,
  tooltipShortcut,
  className,
  children,
  ...props
}: ProposalToolbarIconButtonProps) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(proposalToolbarIconButtonClasses(appearance, active), className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent className={PROPOSAL_TOOLBAR_TOKENS.shared.tooltip}>
        {tooltip}
        {tooltipShortcut ? (
          <span className={PROPOSAL_TOOLBAR_TOKENS.shared.tooltipShortcut}>{tooltipShortcut}</span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

export interface ProposalToolbarSectionLabelProps {
  appearance?: ProposalToolbarAppearance;
  className?: string;
  children: React.ReactNode;
}

export function ProposalToolbarSectionLabel({
  appearance: appearanceProp,
  className,
  children,
}: ProposalToolbarSectionLabelProps) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  return (
    <p className={cn(proposalToolbarSectionLabelClasses(appearance), "px-1", className)}>
      {children}
    </p>
  );
}

export function ProposalToolbarSeparator({
  appearance: appearanceProp,
  className,
}: {
  appearance?: ProposalToolbarAppearance;
  className?: string;
}) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  return (
    <Separator
      orientation="vertical"
      className={cn(
        PROPOSAL_TOOLBAR_TOKENS.shared.separator,
        appearance === "elevated" && "bg-white/10",
        className,
      )}
    />
  );
}

export interface ProposalToolbarMenuItemProps extends React.ComponentProps<"button"> {
  appearance?: ProposalToolbarAppearance;
}

export function ProposalToolbarMenuItem({
  appearance: appearanceProp,
  className,
  children,
  ...props
}: ProposalToolbarMenuItemProps) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left outline-none",
        proposalToolbarMenuItemClasses(appearance),
        proposalToolbarMenuItemHoverClasses(appearance),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface ProposalToolbarDragHandleProps {
  ariaLabel: string;
  tooltip: string;
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
}

/** Sortable drag affordance for block toolbars — matches section-band toolbar appearance. */
export function ProposalToolbarDragHandle({
  ariaLabel,
  tooltip,
  dragAttributes,
  dragListeners,
}: ProposalToolbarDragHandleProps) {
  return (
    <Tooltip delayDuration={320}>
      <TooltipTrigger asChild>
        <ProposalToolbarIconButton
          className="touch-none"
          aria-label={ariaLabel}
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-4 w-4" />
        </ProposalToolbarIconButton>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
