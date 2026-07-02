import { Calendar } from "lucide-react";

export interface CustomerTabDateMetaProps {
  label: string;
}

export function CustomerTabDateMeta({ label }: CustomerTabDateMetaProps) {
  return (
    <p className="text-muted-foreground flex min-w-0 items-center gap-1.5 truncate text-sm">
      <Calendar className="size-3.5 shrink-0" aria-hidden />
      <span className="text-foreground/90 truncate">{label}</span>
    </p>
  );
}
