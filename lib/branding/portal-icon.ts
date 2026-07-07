import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";

const DEFAULT_FAVICON_PATH = join(process.cwd(), "public/assets/default-favicon.ico");

/** Branding icon URL from Firestore — favicon first, then logo. */
export async function resolvePortalIconSourceUrl(): Promise<string | null> {
  const appearance = await getPortalAppearanceSettings();
  return appearance?.faviconUrl?.trim() || appearance?.logoUrl?.trim() || null;
}

/** Bundled template favicon used when no branding icon is configured or fetch fails. */
export async function loadDefaultFaviconBytes(): Promise<Buffer> {
  return readFile(DEFAULT_FAVICON_PATH);
}

/** Resolves the portal favicon from branding settings, falling back to the bundled default. */
export async function buildPortalIconResponse(): Promise<Response> {
  const sourceUrl = await resolvePortalIconSourceUrl();

  if (sourceUrl) {
    try {
      const upstream = await fetch(sourceUrl, { cache: "no-store" });
      if (upstream.ok) {
        const bytes = await upstream.arrayBuffer();
        return new Response(bytes, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "image/png",
            "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
          },
        });
      }
    } catch {
      // Fall through to bundled default.
    }
  }

  const fallback = await loadDefaultFaviconBytes();
  return new Response(new Uint8Array(fallback), {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
