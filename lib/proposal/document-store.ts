import { arrayMove } from "@dnd-kit/sortable";

import { cloneProposalDocument } from "@/lib/proposal/clone-document";
import type {
  BlockStyle,
  ProposalAgreementChildBlock,
  ProposalBlock,
  ProposalColumnChildBlock,
  ProposalContentBlock,
  ProposalDocument,
  SectionBackground,
} from "@/types/proposal";

function cloneBlockWithFreshIdsFromLib(block: ProposalBlock): ProposalBlock {
  return cloneProposalDocument({ title: "", blocks: [block] }).blocks[0]!;
}

function mapContentBlock(
  block: ProposalContentBlock,
  id: string,
  visit: (block: ProposalBlock) => ProposalBlock | null,
): ProposalContentBlock | null {
  if (block.id === id) {
    const next = visit(block as ProposalBlock);
    return next as ProposalContentBlock | null;
  }
  if (block.type === "columns") {
    let changed = false;
    const stacks = block.stacks.map((stack) => {
      const nextStack = stack
        .map((cell) => mapContentBlock(cell as ProposalContentBlock, id, visit))
        .filter((c): c is ProposalColumnChildBlock => c !== null);
      if (nextStack.length !== stack.length || nextStack.some((c, i) => c !== stack[i])) {
        changed = true;
      }
      return nextStack;
    });
    if (!changed) return block;
    return { ...block, stacks };
  }
  return block;
}

function mapRootBlock(
  block: ProposalBlock,
  id: string,
  visit: (block: ProposalBlock) => ProposalBlock | null,
): ProposalBlock | null {
  if (block.id === id) return visit(block);

  if (block.type === "section") {
    let changed = false;
    const children = block.children
      .map((child) => {
        const next = mapContentBlock(child, id, visit);
        if (next !== child) changed = true;
        return next;
      })
      .filter((c): c is ProposalContentBlock => c !== null);
    if (!changed) return block;
    return { ...block, children };
  }

  if (block.type === "agreement") {
    let changed = false;
    const children = block.children
      .map((child) => {
        const next = mapContentBlock(child as ProposalContentBlock, id, visit);
        if (next !== child) changed = true;
        return next;
      })
      .filter((c): c is ProposalAgreementChildBlock => c !== null);
    if (!changed) return block;
    return { ...block, children };
  }

  if (block.type === "columns") {
    let changed = false;
    const stacks = block.stacks.map((stack) => {
      const nextStack = stack
        .map((cell) => mapContentBlock(cell as ProposalContentBlock, id, visit))
        .filter((c): c is ProposalColumnChildBlock => c !== null);
      if (nextStack.length !== stack.length || nextStack.some((c, i) => c !== stack[i])) {
        changed = true;
      }
      return nextStack;
    });
    if (!changed) return block;
    return { ...block, stacks };
  }

  return block;
}

function mapBlocks(
  blocks: ProposalBlock[],
  id: string,
  visit: (block: ProposalBlock) => ProposalBlock | null,
): ProposalBlock[] {
  const out: ProposalBlock[] = [];
  for (const block of blocks) {
    const next = mapRootBlock(block, id, visit);
    if (next !== null) out.push(next);
  }
  return out;
}

/** Immutable document tree operations for the proposal builder. */
export function updateBlockById(
  document: ProposalDocument,
  id: string,
  updater: (block: ProposalBlock) => ProposalBlock,
): ProposalDocument {
  return {
    ...document,
    blocks: mapBlocks(document.blocks, id, (block) => updater(block)),
  };
}

export function removeBlockById(document: ProposalDocument, id: string): ProposalDocument {
  return {
    ...document,
    blocks: mapBlocks(document.blocks, id, () => null),
  };
}

export function insertRootBlockAt(
  document: ProposalDocument,
  index: number,
  block: ProposalBlock,
): ProposalDocument {
  const blocks = [...document.blocks];
  const safeIndex = Math.max(0, Math.min(index, blocks.length));
  blocks.splice(safeIndex, 0, block);
  return { ...document, blocks };
}

export function moveRootBlock(
  document: ProposalDocument,
  id: string,
  direction: -1 | 1,
): ProposalDocument {
  const blocks = [...document.blocks];
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx < 0) return document;
  const target = idx + direction;
  if (target < 0 || target >= blocks.length) return document;
  return { ...document, blocks: arrayMove(blocks, idx, target) };
}

export function reorderRootBlocks(document: ProposalDocument, activeId: string, overId: string): ProposalDocument {
  const blocks = [...document.blocks];
  const oldIndex = blocks.findIndex((b) => b.id === activeId);
  const newIndex = blocks.findIndex((b) => b.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return document;
  return { ...document, blocks: arrayMove(blocks, oldIndex, newIndex) };
}

export function duplicateBlockById(document: ProposalDocument, id: string): ProposalDocument {
  const rootIdx = document.blocks.findIndex((b) => b.id === id);
  if (rootIdx >= 0) {
    const cloned = cloneBlockWithFreshIdsFromLib(document.blocks[rootIdx]!);
    const blocks = [...document.blocks];
    blocks.splice(rootIdx + 1, 0, cloned);
    return { ...document, blocks };
  }
  return document;
}

function blockTypeSupportsStyle(type: ProposalBlock["type"]): boolean {
  return type === "packages" || type === "pricing";
}

type CommerceStyledBlock = ProposalBlock & { style?: BlockStyle };

/** Keep toolbar-applied `style` when inline editors submit a stale block copy without it. */
function preserveCommerceBlockStyleOnContentUpdate(
  existing: CommerceStyledBlock,
  incoming: CommerceStyledBlock,
): CommerceStyledBlock {
  if (existing.type !== incoming.type) return incoming;
  if (!blockTypeSupportsStyle(existing.type)) return incoming;
  if (existing.style === undefined) return incoming;
  if (incoming.style !== undefined) return incoming;
  return { ...incoming, style: existing.style };
}

/**
 * Recursively preserve packages/pricing `style` on content edits that replace a parent
 * (section, agreement, columns) or the commerce block itself with a stale payload.
 */
export function mergeNestedCommerceBlockStyles(
  existing: ProposalBlock,
  incoming: ProposalBlock,
): ProposalBlock {
  if (existing.id !== incoming.id || existing.type !== incoming.type) {
    return incoming;
  }

  if (blockTypeSupportsStyle(existing.type)) {
    return preserveCommerceBlockStyleOnContentUpdate(
      existing as CommerceStyledBlock,
      incoming as CommerceStyledBlock,
    );
  }

  if (existing.type === "section" && incoming.type === "section") {
    const children = incoming.children.map((child) => {
      const prev = existing.children.find((c) => c.id === child.id);
      if (!prev) return child;
      return mergeNestedCommerceBlockStyles(prev as ProposalBlock, child as ProposalBlock) as ProposalContentBlock;
    });
    return { ...incoming, children };
  }

  if (existing.type === "agreement" && incoming.type === "agreement") {
    const children = incoming.children.map((child) => {
      const prev = existing.children.find((c) => c.id === child.id);
      if (!prev) return child;
      return mergeNestedCommerceBlockStyles(prev as ProposalBlock, child as ProposalBlock) as ProposalAgreementChildBlock;
    });
    return { ...incoming, children };
  }

  if (existing.type === "columns" && incoming.type === "columns") {
    const stacks = incoming.stacks.map((stack, stackIndex) =>
      stack.map((child) => {
        const prevStack = existing.stacks[stackIndex];
        const prev = prevStack?.find((c) => c.id === child.id);
        if (!prev) return child;
        return mergeNestedCommerceBlockStyles(prev as ProposalBlock, child as ProposalBlock) as ProposalColumnChildBlock;
      }),
    );
    return { ...incoming, stacks };
  }

  return incoming;
}

export function applyBlockStyleById(
  document: ProposalDocument,
  id: string,
  style: BlockStyle | undefined,
): ProposalDocument {
  return updateBlockById(document, id, (block) => {
    if (!blockTypeSupportsStyle(block.type)) return block;
    if (style === undefined) {
      const { style: _drop, ...rest } = block as ProposalBlock & { style?: BlockStyle };
      void _drop;
      return rest as ProposalBlock;
    }
    return { ...block, style } as ProposalBlock;
  });
}

/** Clears or sets `background` on section, plans, or accept blocks. */
export function patchBlockBackground(
  document: ProposalDocument,
  id: string,
  background: SectionBackground | undefined,
): ProposalDocument {
  return updateBlockById(document, id, (block) => {
    if (block.type !== "section" && block.type !== "packages" && block.type !== "agreement") {
      return block;
    }
    if (!background) {
      const { background: _drop, ...rest } = block;
      void _drop;
      return rest as ProposalBlock;
    }
    return { ...block, background } as ProposalBlock;
  });
}

export function setDocumentBlocks(
  document: ProposalDocument,
  blocks: ProposalBlock[],
): ProposalDocument {
  return { ...document, blocks };
}

export function setDocumentTitle(document: ProposalDocument, title: string): ProposalDocument {
  return { ...document, title };
}

export type DocumentEditorAction =
  | { type: "setDocument"; document: ProposalDocument }
  | { type: "setTitle"; title: string }
  | { type: "updateBlock"; id: string; block: ProposalBlock }
  | { type: "removeBlock"; id: string }
  | { type: "insertRootBlock"; index: number; block: ProposalBlock }
  | { type: "moveRootBlock"; id: string; direction: -1 | 1 }
  | { type: "reorderRootBlocks"; activeId: string; overId: string }
  | { type: "duplicateBlock"; id: string }
  | { type: "applyBlockStyle"; id: string; style: BlockStyle | undefined }
  | { type: "patchBlockBackground"; id: string; background: SectionBackground | undefined }
  | { type: "setBlocks"; blocks: ProposalBlock[] }
  | { type: "setBlocksUpdater"; updater: (blocks: ProposalBlock[]) => ProposalBlock[] };

export function documentEditorReducer(
  state: ProposalDocument,
  action: DocumentEditorAction,
): ProposalDocument {
  switch (action.type) {
    case "setDocument":
      return action.document;
    case "setTitle":
      return setDocumentTitle(state, action.title);
    case "updateBlock":
      return updateBlockById(state, action.id, (existing) =>
        mergeNestedCommerceBlockStyles(existing, action.block),
      );
    case "removeBlock":
      return removeBlockById(state, action.id);
    case "insertRootBlock":
      return insertRootBlockAt(state, action.index, action.block);
    case "moveRootBlock":
      return moveRootBlock(state, action.id, action.direction);
    case "reorderRootBlocks":
      return reorderRootBlocks(state, action.activeId, action.overId);
    case "duplicateBlock":
      return duplicateBlockById(state, action.id);
    case "applyBlockStyle":
      return applyBlockStyleById(state, action.id, action.style);
    case "patchBlockBackground":
      return patchBlockBackground(state, action.id, action.background);
    case "setBlocks":
      return setDocumentBlocks(state, action.blocks);
    case "setBlocksUpdater":
      return setDocumentBlocks(state, action.updater(state.blocks));
    default:
      return state;
  }
}
