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
