import * as React from "react";

export interface PropertyFieldProps {
  label: string;
  children: React.ReactNode;
}

/** Read-only Properties sidebar field — label + value stack (builder inspector panels). */
export function PropertyField({ label, children }: PropertyFieldProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{label}</h4>
      {children}
    </div>
  );
}

export function propertyMutedText(value: string | undefined): React.ReactNode {
  return <p className="text-muted-foreground text-sm">{value?.trim() || "—"}</p>;
}
