import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import type { TemplateHubKind, TemplateHubRow } from "@/lib/templates/hub-rows";
import { templateStageBadgeDisplay } from "@/lib/templates/status-badges";

export interface FilterTemplateHubRowsOptions {
  kind: TemplateHubKind;
  searchQuery: string;
  localityTimeZone?: string;
}

/** Tab + search filter for the templates hub card grid. */
export function filterTemplateHubRows(
  rows: TemplateHubRow[],
  { kind, searchQuery, localityTimeZone }: FilterTemplateHubRowsOptions
): TemplateHubRow[] {
  const q = searchQuery.trim().toLowerCase();

  return rows
    .filter((row) => row.kind === kind)
    .filter((row) => {
      if (!q) return true;
      const stage = templateStageBadgeDisplay(row.stage);
      const hay = [
        row.name,
        row.description ?? "",
        row.agreementTitle ?? "",
        stage.label,
        formatLastEditedInLocality(row.lastEditedMs, localityTimeZone),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => b.lastEditedMs - a.lastEditedMs);
}
