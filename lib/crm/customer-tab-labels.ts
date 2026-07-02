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

export function proposalEngagementLabel(totalEngagementSeconds: number | undefined): string {
  if (typeof totalEngagementSeconds !== "number") return "Engagement not recorded";
  const minutes = Math.max(0, Math.round(totalEngagementSeconds / 60));
  return `${minutes} min on page`;
}

export function documentSignedLabel(signedAt: number): string {
  if (signedAt <= 0) return "—";
  return formatTabDateTime(signedAt);
}
