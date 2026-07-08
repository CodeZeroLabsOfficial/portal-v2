import type {
  AgreementBlock,
  ColumnsBlock,
  ProposalAgreementChildBlock,
  ProposalBlock,
  ProposalColumnChildBlock,
  ProposalContentBlock,
} from "@/types/proposal";

export function newBlockId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `b-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Deep-clones a block and nested collections (tiers, line items, form fields). Used by the toolbar Duplicate action. */
export function cloneBlockWithFreshIds(block: ProposalBlock): ProposalBlock {
  switch (block.type) {
    case "pricing":
      return {
        ...block,
        id: newBlockId(),
        lineItems: (block.lineItems ?? []).map((li) => ({ ...li, id: newBlockId() })),
      };
    case "packages":
      return {
        ...block,
        id: newBlockId(),
        tiers: (block.tiers ?? []).map((t) => ({ ...t, id: newBlockId(), features: [...(t.features ?? [])] })),
        addonLineItems: (block.addonLineItems ?? []).map((li) => ({ ...li, id: newBlockId() })),
      };
    case "form":
      return {
        ...block,
        id: newBlockId(),
        fields: (block.fields ?? []).map((f) => ({ ...f, id: newBlockId(), options: f.options ? [...f.options] : undefined })),
      };
    case "accordion":
      return {
        ...block,
        id: newBlockId(),
        panels: block.panels.map((p) => ({
          ...p,
          id: newBlockId(),
        })),
      };
    case "columns": {
      const c = block as ColumnsBlock;
      return {
        ...c,
        id: newBlockId(),
        stacks: c.stacks.map((stack) =>
          stack.map((child) => cloneBlockWithFreshIds(child as ProposalBlock) as ProposalColumnChildBlock),
        ),
      };
    }
    case "icon":
      return { ...block, id: newBlockId() };
    case "splash":
      return { ...block, id: newBlockId() };
    case "section":
      return {
        ...block,
        id: newBlockId(),
        children: block.children.map((c) => cloneBlockWithFreshIds(c as ProposalBlock) as ProposalContentBlock),
      };
    case "agreement":
      return {
        ...block,
        id: newBlockId(),
        children: (block as AgreementBlock).children.map(
          (c) => cloneBlockWithFreshIds(c as ProposalBlock) as ProposalAgreementChildBlock,
        ),
      };
    default:
      return { ...block, id: newBlockId() } as ProposalBlock;
  }
}
