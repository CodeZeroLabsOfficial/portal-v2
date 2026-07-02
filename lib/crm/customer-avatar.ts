/** Avatar URLs from these hosts are safe to render with next/image or AvatarImage. */
export function customerAvatarUrl(raw: string | undefined | null): string | null {
  const url = raw?.trim();
  if (!url) return null;
  if (url.includes("googleusercontent.com") || url.includes("firebasestorage.googleapis.com")) {
    return url;
  }
  return null;
}
