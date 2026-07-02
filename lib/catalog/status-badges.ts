import type { CatalogServiceKind, CatalogServiceStatus } from "@/types/catalog-service";
import type { StatusBadgeDisplay } from "@/lib/crm/status-badges";

export function catalogServiceStatusBadgeDisplay(status: CatalogServiceStatus): StatusBadgeDisplay {
  switch (status) {
    case "active":
      return { label: "Active", variant: "success" };
    case "draft":
      return { label: "Draft", variant: "warning" };
    default:
      return { label: "Archived", variant: "secondary" };
  }
}

export function catalogServiceKindBadgeDisplay(kind: CatalogServiceKind | undefined): StatusBadgeDisplay {
  if (kind === "addon") {
    return { label: "Add-on", variant: "info" };
  }
  if (kind === "plan") {
    return { label: "Plan", variant: "secondary" };
  }
  return { label: "—", variant: "secondary" };
}

export function catalogStripeSyncBadgeDisplay(
  stripeProductId: string | undefined,
  stripeSyncedAt: number | undefined
): StatusBadgeDisplay {
  if (!stripeProductId?.trim()) {
    return { label: "Not synced", variant: "secondary" };
  }
  if (stripeSyncedAt) {
    return { label: "Synced", variant: "success" };
  }
  return { label: "Linked", variant: "info" };
}
