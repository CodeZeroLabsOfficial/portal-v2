import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface PageBackButtonProps {
  href: string;
  /** Accessible label, e.g. "Customers", "Pipeline", "Templates". */
  label: string;
}

/** Outline chevron back control — matches proposal/template builder top bar. */
export function PageBackButton({ href, label }: PageBackButtonProps) {
  return (
    <Button variant="outline" size="icon-sm" className="shrink-0" asChild>
      <Link href={href} aria-label={label}>
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
    </Button>
  );
}
