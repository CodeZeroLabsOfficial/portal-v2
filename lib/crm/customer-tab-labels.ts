function formatTabDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function proposalSentLabel(sentAt?: number): string {
  if (typeof sentAt !== "number" || sentAt <= 0) return "Not sent";
  return `Sent ${formatTabDateTime(sentAt)}`;
}

export function proposalViewsLabel(viewCount: number | undefined): string {
  if (typeof viewCount !== "number" || viewCount === 0) return "No views";
  return viewCount === 1 ? "1 open" : `${viewCount} opens`;
}

export function documentSignedLabel(signedAt: number): string {
  if (signedAt <= 0) return "—";
  return formatTabDateTime(signedAt);
}
