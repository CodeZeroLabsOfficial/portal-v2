import type { PackageSelectionSummary } from "@/lib/proposal/agreement/package-selection-summary";
import type { SignedAgreementAddonSnapshot, SignedAgreementRecord } from "@/types/signed-agreement";

function addonLinesFromSnapshots(addons: SignedAgreementAddonSnapshot[]): PackageSelectionSummary["addonLines"] {
  return addons.map((a, index) => ({
    id: `signed-addon-${index}`,
    label: a.label,
    quantity: a.quantity,
    unitAmountMinor: a.unitAmountMinor,
    lineTotalMinor: a.lineTotalMinor,
    billingKind: a.billingKind ?? "recurring",
  }));
}

function oneOffAddonsMinorFromLines(lines: PackageSelectionSummary["addonLines"]): number {
  return lines
    .filter((l) => l.billingKind === "one_off")
    .reduce((sum, l) => sum + l.lineTotalMinor, 0);
}

/** Legacy rows signed before `packageSnapshots` was stored. */
function legacyPackageSummariesFromRecord(record: SignedAgreementRecord): PackageSelectionSummary[] {
  const addons = record.addons ?? [];
  const byBlock = new Map<string, SignedAgreementAddonSnapshot[]>();
  for (const addon of addons) {
    const key = addon.packageBlockTitle?.trim() || "Plan";
    const list = byBlock.get(key) ?? [];
    list.push(addon);
    byBlock.set(key, list);
  }

  const planParts = record.selectedPlan
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (byBlock.size === 0 && planParts.length === 0) {
    return [];
  }

  if (byBlock.size <= 1 && planParts.length <= 1) {
    const blockTitle = [...byBlock.keys()][0] ?? "Plan";
    const blockAddons = byBlock.get(blockTitle) ?? addons;
    const addonLines = addonLinesFromSnapshots(blockAddons);
    const planText = planParts[0] ?? record.selectedPlan;
    const tierName = planText.includes(":") ? (planText.split(":")[1]?.trim() ?? planText) : planText;

    return [
      {
        blockId: "legacy-signed",
        blockTitle,
        currency: record.totalAmount.currency,
        tierName,
        termLabel: "",
        monthlyMinor: record.totalAmount.monthlyTotalMinor,
        monthlyTotalMinor: record.totalAmount.monthlyTotalMinor,
        upfrontMinor: 0,
        oneOffAddonsMinor: oneOffAddonsMinorFromLines(addonLines),
        addonLines,
      },
    ];
  }

  const summaries: PackageSelectionSummary[] = [];
  let index = 0;
  for (const [blockTitle, blockAddons] of byBlock) {
    const planPart = planParts[index] ?? planParts[planParts.length - 1] ?? record.selectedPlan;
    const tierName = planPart.includes(":") ? (planPart.split(":").slice(1).join(":").trim() || planPart) : planPart;
    const addonLines = addonLinesFromSnapshots(blockAddons);
    summaries.push({
      blockId: `legacy-signed-${index}`,
      blockTitle,
      currency: record.totalAmount.currency,
      tierName,
      termLabel: "",
      monthlyMinor: record.totalAmount.monthlyTotalMinor,
      monthlyTotalMinor: record.totalAmount.monthlyTotalMinor,
      upfrontMinor: 0,
      oneOffAddonsMinor: oneOffAddonsMinorFromLines(addonLines),
      addonLines,
    });
    index += 1;
  }

  return summaries;
}

export function packageSummariesFromSignedRecord(record: SignedAgreementRecord): PackageSelectionSummary[] {
  if (record.packageSnapshots?.length) {
    return record.packageSnapshots;
  }
  return legacyPackageSummariesFromRecord(record);
}
