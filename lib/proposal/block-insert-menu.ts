import type { LucideIcon } from "lucide-react";
import {
  Coins,
  CreditCard,
  Heading,
  ImageIcon,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  ListTree,
  MonitorPlay,
  Mountain,
  MoveVertical,
  Package,
  PenLine,
  ScrollText,
  SeparatorHorizontal,
  SquarePen,
  Star,
} from "lucide-react";

import {
  type BlockMenuProfile,
  getBlockDefinition,
  PROPOSAL_BLOCK_DEFINITIONS,
  type ProposalBlockDefinition,
} from "@/components/features/proposal/blocks/block-editor-registry";
import {
  createColumnsBlock,
  createSingleChildSection,
  isSingleChildSectionContentType,
} from "@/lib/proposal/block-definitions";
import type { ProposalBlock } from "@/types/proposal";

export interface BlockInsertOption {
  id: string;
  type: ProposalBlock["type"];
  label: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
  factory?: () => ProposalBlock;
}

type InsertMenuPreset =
  | "root-primary"
  | "root-library"
  | "section"
  | "column-content"
  | "column-interactive";

type BlockPresentation = Pick<BlockInsertOption, "icon" | "accent" | "accentBg">;

const BLOCK_PRESENTATION: Partial<Record<ProposalBlock["type"], BlockPresentation>> = {
  text: { icon: ScrollText, accent: "text-violet-500", accentBg: "bg-violet-500/10" },
  header: { icon: Heading, accent: "text-sky-500", accentBg: "bg-sky-500/10" },
  splash: { icon: Mountain, accent: "text-teal-400", accentBg: "bg-teal-500/10" },
  pricing: { icon: Coins, accent: "text-emerald-500", accentBg: "bg-emerald-500/10" },
  packages: { icon: Package, accent: "text-amber-500", accentBg: "bg-amber-500/10" },
  video: { icon: MonitorPlay, accent: "text-rose-500", accentBg: "bg-rose-500/10" },
  agreement: { icon: PenLine, accent: "text-cyan-500", accentBg: "bg-cyan-500/10" },
  section: { icon: Layers, accent: "text-sky-500", accentBg: "bg-sky-500/10" },
  image: { icon: ImageIcon, accent: "text-fuchsia-500", accentBg: "bg-fuchsia-500/10" },
  columns: { icon: LayoutGrid, accent: "text-cyan-500", accentBg: "bg-cyan-500/10" },
  accordion: { icon: ListTree, accent: "text-amber-600", accentBg: "bg-amber-500/10" },
  icon: { icon: Star, accent: "text-yellow-500", accentBg: "bg-yellow-500/10" },
  divider: { icon: SeparatorHorizontal, accent: "text-slate-400", accentBg: "bg-slate-500/10" },
  spacer: { icon: MoveVertical, accent: "text-zinc-400", accentBg: "bg-zinc-500/10" },
  embed: { icon: LayoutTemplate, accent: "text-teal-500", accentBg: "bg-teal-500/10" },
  form: { icon: SquarePen, accent: "text-indigo-500", accentBg: "bg-indigo-500/10" },
  payment: { icon: CreditCard, accent: "text-orange-500", accentBg: "bg-orange-500/10" },
};

/** Monolith uses `proposal` for both CRM proposals and proposal templates. */
export function resolveBlockMenuProfile(
  variant: "proposal" | "template" | "contract-template",
): BlockMenuProfile {
  return variant === "contract-template" ? "contract-template" : "proposal";
}

export function listBlocksForMenu(
  profile: BlockMenuProfile,
  parent: "root" | "section" | "column" | "agreement" = "root",
): ProposalBlockDefinition[] {
  return PROPOSAL_BLOCK_DEFINITIONS.filter((def) => {
    const profileOk =
      profile === "proposal" || profile === "template"
        ? def.allowedProfiles.includes("proposal") || def.allowedProfiles.includes("template")
        : def.allowedProfiles.includes(profile);
    return profileOk && def.allowedParents.includes(parent);
  });
}

const PROPOSAL_MENU_PRESET_ORDER: Record<InsertMenuPreset, ProposalBlock["type"][]> = {
  "root-primary": [
    "section",
    "text",
    "header",
    "splash",
    "pricing",
    "packages",
    "video",
    "agreement",
  ],
  "root-library": ["image", "form", "embed", "payment", "divider", "spacer"],
  section: [
    "text",
    "header",
    "splash",
    "image",
    "columns",
    "accordion",
    "video",
    "icon",
    "divider",
    "spacer",
  ],
  "column-content": [
    "text",
    "header",
    "image",
    "video",
    "icon",
    "divider",
    "spacer",
    "pricing",
    "packages",
  ],
  "column-interactive": ["embed", "form", "payment", "agreement"],
};

const MENU_PRESET_ORDER: Record<BlockMenuProfile, Record<InsertMenuPreset, ProposalBlock["type"][]>> = {
  proposal: PROPOSAL_MENU_PRESET_ORDER,
  template: PROPOSAL_MENU_PRESET_ORDER,
  "contract-template": {
    "root-primary": ["section", "text", "header"],
    "root-library": ["image", "columns", "accordion", "divider", "spacer"],
    section: ["text", "header", "image", "columns", "accordion", "divider", "spacer"],
    "column-content": ["text", "header", "image", "icon", "divider", "spacer"],
    "column-interactive": [],
  },
};

function blockFactory(type: ProposalBlock["type"], preset: InsertMenuPreset): (() => ProposalBlock) | undefined {
  if (type === "columns" && preset === "root-library") {
    return () => createColumnsBlock(2);
  }
  if (
    (preset === "root-primary" || preset === "root-library") &&
    isSingleChildSectionContentType(type)
  ) {
    return () => createSingleChildSection(type);
  }
  const def = getBlockDefinition(type);
  return def ? () => def.createDefault() : undefined;
}

function rootMenuAllowedTypes(
  profile: BlockMenuProfile,
  preset: InsertMenuPreset,
): Set<ProposalBlock["type"]> {
  const allowedTypes = new Set(listBlocksForMenu(profile, "root").map((def) => def.type));
  if (preset === "root-primary" || preset === "root-library") {
    for (const type of MENU_PRESET_ORDER[profile][preset]) {
      if (isSingleChildSectionContentType(type) && getBlockDefinition(type)) {
        allowedTypes.add(type);
      }
    }
  }
  return allowedTypes;
}

function toInsertOption(
  type: ProposalBlock["type"],
  preset: InsertMenuPreset,
  idSuffix: string,
): BlockInsertOption | null {
  const def = getBlockDefinition(type);
  const presentation = BLOCK_PRESENTATION[type];
  if (!def || !presentation) return null;
  return {
    id: `${preset}-${type}-${idSuffix}`,
    type,
    label: def.label,
    icon: presentation.icon,
    accent: presentation.accent,
    accentBg: presentation.accentBg,
    factory: blockFactory(type, preset),
  };
}

export function blockInsertOptions(
  profile: BlockMenuProfile,
  parent: "root" | "section" | "column" | "agreement",
  preset: InsertMenuPreset,
): BlockInsertOption[] {
  const allowedTypes =
    parent === "root"
      ? rootMenuAllowedTypes(profile, preset)
      : new Set(listBlocksForMenu(profile, parent).map((def) => def.type));
  const order = MENU_PRESET_ORDER[profile][preset];
  const options: BlockInsertOption[] = [];

  for (const type of order) {
    if (!allowedTypes.has(type)) continue;
    const option = toInsertOption(type, preset, profile);
    if (option) options.push(option);
  }

  return options;
}

export function documentPrimaryOptions(profile: BlockMenuProfile): BlockInsertOption[] {
  return blockInsertOptions(profile, "root", "root-primary");
}

export function libraryBlockOptions(profile: BlockMenuProfile): BlockInsertOption[] {
  return blockInsertOptions(profile, "root", "root-library");
}

export function sectionInsertOptions(profile: BlockMenuProfile): BlockInsertOption[] {
  return blockInsertOptions(profile, "section", "section");
}

export function columnMenuContent(profile: BlockMenuProfile): BlockInsertOption[] {
  return blockInsertOptions(profile, "column", "column-content");
}

export function columnMenuInteractive(profile: BlockMenuProfile): BlockInsertOption[] {
  return blockInsertOptions(profile, "column", "column-interactive");
}
