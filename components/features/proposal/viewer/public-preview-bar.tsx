import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES,
  PROPOSAL_PUBLIC_PREVIEW_BAR_CLASSES,
} from "@/lib/proposal/public/public-layout";

export interface ProposalPublicPreviewBarProps {
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}

/** Fixed top bar on staff public preview routes — mirrors kit dashboard header density. */
export function ProposalPublicPreviewBar({
  title,
  description,
  backHref,
  backLabel = "Back to edit",
}: ProposalPublicPreviewBarProps) {
  return (
    <header className={PROPOSAL_PUBLIC_PREVIEW_BAR_CLASSES}>
      <div
        className={`${PROPOSAL_PUBLIC_PAGE_COLUMN_CLASSES} flex flex-wrap items-center justify-between gap-3`}
      >
        <Typography variant="muted" className="max-w-3xl text-pretty">
          <span className="text-foreground font-medium">{title}</span>
          {" — "}
          {description}
        </Typography>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
          <Link href={backHref}>
            <ArrowLeft className="size-4" aria-hidden />
            {backLabel}
          </Link>
        </Button>
      </div>
    </header>
  );
}

export interface ProposalPublicPreviewFrameProps {
  bar: ReactNode;
  children: ReactNode;
}

/** Staff preview page wrapper — fixed bar + offset main. */
export function ProposalPublicPreviewFrame({ bar, children }: ProposalPublicPreviewFrameProps) {
  return (
    <div className="bg-background relative min-h-dvh">
      {bar}
      {children}
    </div>
  );
}
