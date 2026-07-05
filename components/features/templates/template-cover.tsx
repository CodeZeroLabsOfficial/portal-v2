import Image from "next/image";
import { LayoutTemplate } from "lucide-react";

import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import { cn } from "@/lib/utils";

export interface TemplateCoverProps {
  coverImageUrl?: string;
  alt: string;
  kind: TemplateHubKind;
  className?: string;
}

function isNextImageRemoteUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return false;
    return (
      hostname === "firebasestorage.googleapis.com" ||
      hostname.endsWith(".googleusercontent.com")
    );
  } catch {
    return false;
  }
}

export function TemplateCover({ coverImageUrl, alt, kind, className }: TemplateCoverProps) {
  if (coverImageUrl) {
    return (
      <figure className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}>
        {isNextImageRemoteUrl(coverImageUrl) ? (
          <Image src={coverImageUrl} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- splash defaults and blob URLs may be external
          <img src={coverImageUrl} alt={alt} className="size-full object-cover" />
        )}
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden",
        kind === "proposal"
          ? "bg-gradient-to-br from-primary/10 via-muted to-muted"
          : "bg-gradient-to-br from-secondary/30 via-muted to-muted",
        className
      )}
      aria-hidden>
      <LayoutTemplate className="text-muted-foreground size-10" />
    </figure>
  );
}
