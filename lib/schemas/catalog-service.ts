import { z } from "zod";
import {
  CATALOG_CATEGORIES,
  type CatalogCategoryId,
} from "@/lib/catalog/categories";
import {
  applyCatalogServiceTermLookupKeys,
  normalizeLookupKeyBase,
  slugifyCatalogServiceName,
} from "@/lib/catalog/service-slug";
import type { CatalogServiceKind, CatalogServiceRecord, CatalogServiceTerm } from "@/types/catalog-service";

const trimmed = z.string().trim();
const lookupKeyBaseField = trimmed
  .min(1, "Lookup key is required")
  .max(40)
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only");

const catalogCategoryIds = CATALOG_CATEGORIES.map((c) => c.id) as [
  CatalogCategoryId,
  ...CatalogCategoryId[],
];

const STRIPE_MIN_MINOR = 50;

const catalogServiceFieldsSchema = z.object({
  serviceType: z.enum(["plan", "addon"]),
  category: z.enum(catalogCategoryIds),
  name: trimmed.min(1, "Name is required").max(120),
  description: trimmed.max(500).optional(),
  billingType: z.enum(["recurring", "one_off"]),
  pricingModel: z.enum(["flat", "by_term"]),
  lookupKeyBase: lookupKeyBaseField,
  currency: trimmed.min(3).max(3).default("aud"),
  flatAmountMinor: z.number().finite().min(0).optional(),
  monthlyCost12Minor: z.number().finite().min(0).optional(),
  monthlyCost24Minor: z.number().finite().min(0).optional(),
  includedUsers: z.number().int().min(0).max(1_000_000).default(0),
  includedLocations: z.number().int().min(0).max(1_000_000).default(0),
  includedAdmins: z.number().int().min(0).max(1_000_000).default(0),
  upfrontCost12Minor: z.number().finite().min(0).optional(),
  upfrontCost24Minor: z.number().finite().min(0).optional(),
});

function refineCatalogServicePricing<
  T extends z.ZodTypeAny,
>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const effectivePricing =
      data.billingType === "one_off" ? ("flat" as const) : data.pricingModel;

    if (effectivePricing === "flat") {
      if (typeof data.flatAmountMinor !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price is required",
          path: ["flatAmountMinor"],
        });
      } else if (data.flatAmountMinor < STRIPE_MIN_MINOR) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Price must be at least ${STRIPE_MIN_MINOR / 100} AUD`,
          path: ["flatAmountMinor"],
        });
      }
    } else {
      if (typeof data.monthlyCost12Minor !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "12-month price is required",
          path: ["monthlyCost12Minor"],
        });
      } else if (data.monthlyCost12Minor < STRIPE_MIN_MINOR) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `12-month price must be at least ${STRIPE_MIN_MINOR / 100} AUD`,
          path: ["monthlyCost12Minor"],
        });
      }
      if (typeof data.monthlyCost24Minor !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "24-month price is required",
          path: ["monthlyCost24Minor"],
        });
      } else if (data.monthlyCost24Minor < STRIPE_MIN_MINOR) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `24-month price must be at least ${STRIPE_MIN_MINOR / 100} AUD`,
          path: ["monthlyCost24Minor"],
        });
      }
    }

    if (data.billingType === "one_off" && data.pricingModel === "by_term") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "One-off services use a single flat price",
        path: ["pricingModel"],
      });
    }
  });
}

export const createCatalogServiceSchema = refineCatalogServicePricing(catalogServiceFieldsSchema);

export type CreateCatalogServiceInput = z.infer<typeof createCatalogServiceSchema>;

export function createInputToServiceTerms(input: CreateCatalogServiceInput): CatalogServiceTerm[] {
  const slug = resolveCreateCatalogSlug(input);
  return buildTermsFromPricingInput(slug, input.serviceType, input);
}

export function resolveCreateCatalogSlug(input: CreateCatalogServiceInput): string {
  return normalizeLookupKeyBase(input.lookupKeyBase) || slugifyCatalogServiceName(input.name);
}

export const updateCatalogServiceSchema = refineCatalogServicePricing(
  catalogServiceFieldsSchema.omit({ serviceType: true }).extend({
    serviceId: trimmed.min(1, "Service id is required"),
  }),
);

export type UpdateCatalogServiceInput = z.infer<typeof updateCatalogServiceSchema>;

export const updateCatalogServiceFeaturesSchema = z.object({
  serviceId: trimmed.min(1, "Service id is required"),
  features: z.array(trimmed.min(1).max(200)).max(50),
});

export type UpdateCatalogServiceFeaturesInput = z.infer<typeof updateCatalogServiceFeaturesSchema>;

function buildTermsFromPricingInput(
  slug: string,
  serviceType: CatalogServiceKind,
  input: Pick<
    CreateCatalogServiceInput,
    | "category"
    | "billingType"
    | "pricingModel"
    | "flatAmountMinor"
    | "monthlyCost12Minor"
    | "monthlyCost24Minor"
  >,
): CatalogServiceTerm[] {
  const pricingModel = input.billingType === "one_off" ? "flat" : input.pricingModel;

  const terms: CatalogServiceTerm[] =
    pricingModel === "by_term"
      ? [
          {
            months: 12,
            monthlyAmountMinor: Math.round(input.monthlyCost12Minor ?? 0),
          },
          {
            months: 24,
            monthlyAmountMinor: Math.round(input.monthlyCost24Minor ?? 0),
          },
        ]
      : [
          {
            monthlyAmountMinor: Math.round(input.flatAmountMinor ?? 0),
          },
        ];

  return applyCatalogServiceTermLookupKeys(
    {
      slug,
      category: input.category,
      serviceType,
      billingType: input.billingType,
      pricingModel,
    },
    terms,
  );
}

export function updateInputToServiceTerms(
  service: Pick<CatalogServiceRecord, "serviceType" | "slug" | "terms">,
  input: UpdateCatalogServiceInput,
): CatalogServiceTerm[] {
  const slug =
    normalizeLookupKeyBase(input.lookupKeyBase) ||
    service.slug.trim() ||
    slugifyCatalogServiceName(input.name);
  const serviceType = service.serviceType ?? "plan";
  const nextTerms = buildTermsFromPricingInput(slug, serviceType, input);

  return nextTerms.map((term) => {
    const previous =
      nextTerms.length > 1
        ? service.terms.find(
            (existing) =>
              existing.months === term.months &&
              existing.monthlyAmountMinor === term.monthlyAmountMinor,
          )
        : service.terms.find(
            (existing) =>
              !existing.months &&
              !term.months &&
              existing.monthlyAmountMinor === term.monthlyAmountMinor,
          );

    if (!previous?.stripePriceId?.trim()) return term;
    return {
      ...term,
      stripePriceId: previous.stripePriceId,
    };
  });
}

export function resolveUpdateCatalogSlug(input: UpdateCatalogServiceInput): string {
  return normalizeLookupKeyBase(input.lookupKeyBase) || slugifyCatalogServiceName(input.name);
}
