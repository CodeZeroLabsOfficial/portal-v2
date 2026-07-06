import { formatLastEditedInLocality } from "@/lib/proposal/public/locality-dates";
import {
  compareTemplateHubRowsByTitle,
  type TemplateHubRow,
  type TemplateHubTab,
} from "@/lib/templates/hub-rows";
import { templateStageBadgeDisplay } from "@/lib/templates/status-badges";

export interface FilterTemplateHubRowsOptions {
  tab: TemplateHubTab;
  searchQuery: string;
  localityTimeZone?: string;
}

/** Tab + search filter for the templates hub card grid. */
export function filterTemplateHubRows(
  rows: TemplateHubRow[],
  { tab, searchQuery, localityTimeZone }: FilterTemplateHubRowsOptions
): TemplateHubRow[] {
  const q = searchQuery.trim().toLowerCase();

  return rows
    .filter((row) => tab === "all" || row.kind === tab)
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
    .sort(compareTemplateHubRowsByTitle);
}
