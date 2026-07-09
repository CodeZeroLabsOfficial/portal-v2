import { asNumber, asString } from "@/lib/firestore/coerce";
import type {
  SignedAgreementAddonSnapshot,
  SignedAgreementPackageSnapshot,
  SignedAgreementRecord,
  SignedAgreementTotalAmount,
} from "@/types/signed-agreement";

function parseAddons(raw: unknown): SignedAgreementAddonSnapshot[] {
  if (!Array.isArray(raw)) return [];
  const out: SignedAgreementAddonSnapshot[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const label = asString(o.label)?.trim() || "Add-on";
    const quantity = asNumber(o.quantity);
    const unitAmountMinor = asNumber(o.unitAmountMinor);
    const lineTotalMinor = asNumber(o.lineTotalMinor);
    const currency = (asString(o.currency) || "AUD").toUpperCase();
    if (
      typeof quantity !== "number" ||
      typeof unitAmountMinor !== "number" ||
      typeof lineTotalMinor !== "number"
    ) {
      continue;
    }
    out.push({
      label,
      quantity: Math.max(0, Math.floor(quantity)),
      unitAmountMinor,
      lineTotalMinor,
      currency,
      packageBlockTitle: asString(o.packageBlockTitle),
      billingKind:
        o.billingKind === "one_off" || o.billingKind === "recurring" ? o.billingKind : undefined,
    });
  }
  return out;
}

function parsePackageSnapshots(raw: unknown): SignedAgreementPackageSnapshot[] {
  if (!Array.isArray(raw)) return [];
  const out: SignedAgreementPackageSnapshot[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const blockId = asString(o.blockId)?.trim();
    if (!blockId) continue;
    const addonLinesRaw = o.addonLines;
    const addonLines: SignedAgreementPackageSnapshot["addonLines"] = [];
    if (Array.isArray(addonLinesRaw)) {
      for (const line of addonLinesRaw) {
        if (!line || typeof line !== "object") continue;
        const l = line as Record<string, unknown>;
        const id = asString(l.id)?.trim();
        const label = asString(l.label)?.trim() || "Add-on";
        const quantity = asNumber(l.quantity);
        const unitAmountMinor = asNumber(l.unitAmountMinor);
        const lineTotalMinor = asNumber(l.lineTotalMinor);
        const billingKindRaw = l.billingKind;
        if (
          !id ||
          typeof quantity !== "number" ||
          typeof unitAmountMinor !== "number" ||
          typeof lineTotalMinor !== "number"
        ) {
          continue;
        }
        addonLines.push({
          id,
          label,
          quantity: Math.max(0, Math.floor(quantity)),
          unitAmountMinor,
          lineTotalMinor,
          billingKind: billingKindRaw === "one_off" ? "one_off" : "recurring",
        });
      }
    }
    const monthlyMinor = asNumber(o.monthlyMinor);
    const monthlyTotalMinor = asNumber(o.monthlyTotalMinor);
    const upfrontMinor = asNumber(o.upfrontMinor);
    const oneOffAddonsMinor = asNumber(o.oneOffAddonsMinor);
    if (
      typeof monthlyMinor !== "number" ||
      typeof monthlyTotalMinor !== "number" ||
      typeof upfrontMinor !== "number" ||
      typeof oneOffAddonsMinor !== "number"
    ) {
      continue;
    }
    out.push({
      blockId,
      blockTitle: asString(o.blockTitle)?.trim() || "Plan",
      currency: (asString(o.currency) || "AUD").toUpperCase(),
      tierName: asString(o.tierName)?.trim() || "Plan",
      termLabel: asString(o.termLabel)?.trim() || "",
      monthlyMinor,
      monthlyTotalMinor,
      upfrontMinor,
      oneOffAddonsMinor,
      addonLines,
      stripePriceId: asString(o.stripePriceId),
    });
  }
  return out;
}

function parseTotalAmount(raw: unknown): SignedAgreementTotalAmount {
  if (!raw || typeof raw !== "object") {
    return { currency: "AUD", monthlyTotalMinor: 0, formatted: "—" };
  }
  const o = raw as Record<string, unknown>;
  const currency = (asString(o.currency) || "AUD").toUpperCase();
  const monthlyTotalMinor = asNumber(o.monthlyTotalMinor) ?? 0;
  const formatted = asString(o.formatted) || "—";
  return { currency, monthlyTotalMinor, formatted };
}

export function parseSignedAgreementRecord(id: string, data: Record<string, unknown>): SignedAgreementRecord | null {
  const organizationId = asString(data.organizationId)?.trim();
  const proposalId = asString(data.proposalId)?.trim();
  if (!organizationId || !proposalId) return null;

  const signatureMethodRaw = data.signatureMethod;
  const signatureMethod =
    signatureMethodRaw === "draw" || signatureMethodRaw === "type" || signatureMethodRaw === "upload"
      ? signatureMethodRaw
      : null;

  return {
    id,
    organizationId,
    proposalId,
    shareToken: asString(data.shareToken),
    proposalTitle: asString(data.proposalTitle)?.trim() || "Signed agreement",
    agreementTitle: asString(data.agreementTitle),
    customerId: asString(data.customerId),
    customerEmail: asString(data.customerEmail),
    customerName: asString(data.customerName),
    selectedPlan: asString(data.selectedPlan)?.trim() || "—",
    addons: parseAddons(data.addons),
    packageSnapshots: parsePackageSnapshots(data.packageSnapshots),
    totalAmount: parseTotalAmount(data.totalAmount),
    signerName: asString(data.signerName)?.trim() || "—",
    signerEmail: asString(data.signerEmail),
    signerOrganization: asString(data.signerOrganization),
    signatureMethod,
    signedAt: asNumber(data.signedAt) ?? 0,
    clientSignedAt: asNumber(data.clientSignedAt),
    introHtmlSnapshot: asString(data.introHtmlSnapshot),
    legalHtmlSnapshot: asString(data.legalHtmlSnapshot),
    fullAgreementText: asString(data.fullAgreementText),
    signatureImage: asString(data.signatureImage),
    signatureImageStoragePath: asString(data.signatureImageStoragePath),
    stripeSubscriptionPriceId: asString(data.stripeSubscriptionPriceId),
  };
}
