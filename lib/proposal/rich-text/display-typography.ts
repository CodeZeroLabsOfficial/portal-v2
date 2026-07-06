import { cn } from "@/lib/utils";

export type ProposalRichTextTone = "default" | "muted" | "on-dark";

/** Layout intent for link colors and block spacing; scale is shared. */
export type ProposalRichTextLayout = "body" | "heading" | "caption";

const TONE_CLASSES: Record<ProposalRichTextTone, string> = {
  default: "text-foreground",
  muted: cn(
    "text-muted-foreground",
    "[&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground",
    "[&_a]:text-foreground",
  ),
  "on-dark": cn(
    "text-white/[0.92]",
    "[&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white",
    "[&_a]:text-sky-200 [&_a]:underline",
    "[&_blockquote]:border-white/35 [&_blockquote]:text-white/75",
  ),
};

const LAYOUT_CLASSES: Record<ProposalRichTextLayout, string> = {
  body: cn(
    "[&_a]:underline",
    "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
    "[&_blockquote]:text-muted-foreground",
  ),
  heading: cn(
    "min-w-0 scroll-mt-20",
    "[&_a]:text-primary [&_a]:underline",
    "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  ),
  caption: cn(
    "min-w-0",
    "[&_a]:text-primary [&_a]:underline",
    "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  ),
};

/** Plain caption next to an icon when there is no `labelHtml`. */
export const PROPOSAL_CAPTION_PLAIN_CLASS = cn(
  "text-base font-semibold leading-snug tracking-tight text-foreground md:text-lg",
);

export interface ProposalRichTextDisplayOptions {
  tone?: ProposalRichTextTone;
  layout?: ProposalRichTextLayout;
  className?: string;
}

/** Shared display classes for editor ProseMirror and sanitized HTML viewers. */
export function proposalRichTextDisplayClasses(options?: ProposalRichTextDisplayOptions): string {
  const tone = options?.tone ?? "default";
  const layout = options?.layout ?? "body";

  return cn(
    "proposal-rich-text",
    "max-w-none",
    TONE_CLASSES[tone],
    LAYOUT_CLASSES[layout],
    tone === "default" && layout === "body" && "[&_a]:text-primary",
    tone === "muted" && layout === "body" && "[&_em]:italic",
    options?.className,
  );
}
