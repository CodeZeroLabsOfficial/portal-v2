import { resolveSplashBackdrop } from "@/lib/proposal/splash-block";
import type { ProposalDocument, SplashBlock } from "@/types/proposal";

/** Cover URL from the first root splash block when it has an image or video poster. */
export function resolveTemplateCoverImageUrl(document?: ProposalDocument): string | undefined {
  const blocks = document?.blocks;
  if (!blocks?.length) return undefined;

  const splash = blocks.find((block): block is SplashBlock => block.type === "splash");
  if (!splash) return undefined;

  const resolved = resolveSplashBackdrop(splash.background);

  if (resolved.kind === "image") {
    const url = resolved.imageUrl.trim();
    return url || undefined;
  }

  if (resolved.kind === "video") {
    const poster = resolved.posterUrl.trim();
    return poster || undefined;
  }

  return undefined;
}
