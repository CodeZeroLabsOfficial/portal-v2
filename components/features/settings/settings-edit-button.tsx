"use client";

import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SettingsEditButtonProps {
  onClick: () => void;
  /** Accessible label for the icon-only button. */
  ariaLabel?: string;
}

export function SettingsEditButton({ onClick, ariaLabel = "Edit" }: SettingsEditButtonProps) {
  return (
    <Button type="button" variant="outline" size="icon" onClick={onClick} aria-label={ariaLabel}>
      <PencilIcon />
    </Button>
  );
}
