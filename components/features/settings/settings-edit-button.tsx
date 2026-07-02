"use client";

import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface SettingsEditButtonProps {
  onClick: () => void;
}

export function SettingsEditButton({ onClick }: SettingsEditButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <PencilIcon />
      Edit
    </Button>
  );
}
