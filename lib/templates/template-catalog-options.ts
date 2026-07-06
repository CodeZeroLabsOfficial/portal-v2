export const TEMPLATE_CLASSIFICATIONS = [
  "Business",
  "Consulting",
  "Mobile App Development",
  "Software as a Service",
  "Software Development",
  "Technology Services",
  "Web App Development",
] as const;

export type TemplateClassification = (typeof TEMPLATE_CLASSIFICATIONS)[number];

export const TEMPLATE_CATEGORIES = [
  "General Business",
  "Technology & Software",
  "Marketing & Advertising",
  "Finance & Banking",
  "Real Estate",
  "Healthcare & Medical",
  "Construction & Infrastructure",
  "Education & E-learning",
  "Retail & E-commerce",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Hospitality & Tourism",
  "Legal Services",
  "Non-Profit & Social Impact",
  "Agriculture",
  "Energy & Utilities",
  "Insurance",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];
