/** Hub + Properties sidebar metadata for proposal/contract templates. */
export interface TemplateCatalogMeta {
  /** e.g. "Mobile App Development Proposal" */
  subtitle?: string;
  /** Staff-facing service line (Properties dropdown). */
  classification?: string;
  /** @deprecated Legacy free-text field — use `classification`. */
  useCase?: string;
  /** Industry vertical (Properties dropdown). */
  category?: string;
  /** Display tags on hub cards (e.g. "Dynamic Pricing"). */
  keyFeatures?: string[];
  /** Major.minor without a "v" prefix — stored as "2.3". */
  version?: string;
}

export const EMPTY_TEMPLATE_CATALOG_META: TemplateCatalogMeta = {};

function trimOptional(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function parseKeyFeatures(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const features = raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
  return features.length > 0 ? features.slice(0, 8) : undefined;
}

/** Parses Firestore `catalogMeta` — returns undefined when empty or invalid. */
export function parseTemplateCatalogMeta(raw: unknown): TemplateCatalogMeta | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const data = raw as Record<string, unknown>;
  const meta: TemplateCatalogMeta = {
    subtitle: trimOptional(data.subtitle),
    classification: trimOptional(data.classification),
    useCase: trimOptional(data.useCase),
    category: trimOptional(data.category),
    version: trimOptional(data.version),
    keyFeatures: parseKeyFeatures(data.keyFeatures),
  };

  return normalizeTemplateCatalogMeta(meta);
}

/** Drops empty fields; returns undefined when nothing is set. */
export function normalizeTemplateCatalogMeta(
  meta: TemplateCatalogMeta,
): TemplateCatalogMeta | undefined {
  const normalized: TemplateCatalogMeta = {
    subtitle: trimOptional(meta.subtitle),
    classification: trimOptional(meta.classification),
    useCase: trimOptional(meta.useCase),
    category: trimOptional(meta.category),
    version: trimOptional(meta.version),
    keyFeatures: parseKeyFeatures(meta.keyFeatures),
  };

  const hasValue =
    normalized.subtitle ||
    normalized.classification ||
    normalized.useCase ||
    normalized.category ||
    normalized.version ||
    (normalized.keyFeatures?.length ?? 0) > 0;

  return hasValue ? normalized : undefined;
}

/** Hub category line from catalog meta. */
export function templateCatalogCategoryLabel(meta?: TemplateCatalogMeta): string | undefined {
  if (!meta) return undefined;
  const subtitle = meta.subtitle?.trim();
  if (subtitle) return subtitle;

  const classification = meta.classification?.trim() || meta.useCase?.trim();
  const category = meta.category?.trim();
  if (classification && category) return `${classification} • ${category}`;
  if (classification) return classification;
  if (category) return category;
  return undefined;
}

export function templateCatalogVersionLabel(meta?: TemplateCatalogMeta): string | undefined {
  const version = meta?.version?.trim();
  if (!version) return undefined;
  return version.startsWith("v") ? version : `v${version}`;
}

/** Ensures a saved value outside the current option list still appears in Select menus. */
export function catalogSelectOptions(
  allowed: readonly string[],
  current?: string,
): string[] {
  const value = current?.trim();
  if (value && !allowed.includes(value)) {
    return [value, ...allowed];
  }
  return [...allowed];
}
