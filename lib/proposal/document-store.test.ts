import assert from "node:assert/strict";
import test from "node:test";

import {
  applyBlockStyleById,
  insertRootBlockAt,
  patchBlockBackground,
  removeBlockById,
  reorderRootBlocks,
  updateBlockById,
} from "./document-store";
import type { PackagesBlock, ProposalBlock, ProposalDocument, SectionBlock, TextBlock } from "@/types/proposal";

const textA: TextBlock = { id: "text-a", type: "text", html: "<p>A</p>" };
const textB: TextBlock = { id: "text-b", type: "text", html: "<p>B</p>" };
const section: SectionBlock = {
  id: "section-1",
  type: "section",
  children: [textA],
};

const doc: ProposalDocument = {
  title: "Test",
  blocks: [section, textB],
};

test("updateBlockById patches nested section child", () => {
  const next = updateBlockById(doc, "text-a", (b) => ({
    ...(b as TextBlock),
    html: "<p>Updated</p>",
  }));
  const sectionBlock = next.blocks[0] as SectionBlock;
  const child = sectionBlock.children[0];
  assert.equal(child?.type === "text" ? child.html : null, "<p>Updated</p>");
  assert.equal((next.blocks[1] as TextBlock).html, "<p>B</p>");
});

test("removeBlockById removes nested block", () => {
  const next = removeBlockById(doc, "text-a");
  const sectionBlock = next.blocks[0] as SectionBlock;
  assert.equal(sectionBlock.children.length, 0);
});

test("insertRootBlockAt inserts at index", () => {
  const spacer: ProposalBlock = { id: "spacer-1", type: "spacer", heightPx: 40 };
  const next = insertRootBlockAt(doc, 1, spacer);
  assert.equal(next.blocks.length, 3);
  assert.equal(next.blocks[1]?.id, "spacer-1");
});

test("reorderRootBlocks moves root blocks", () => {
  const next = reorderRootBlocks(doc, "section-1", "text-b");
  assert.equal(next.blocks[0]?.id, "text-b");
  assert.equal(next.blocks[1]?.id, "section-1");
});

test("patchBlockBackground sets and clears section background", () => {
  const withBg = patchBlockBackground(doc, "section-1", {
    kind: "color",
    color: "#ffffff",
  });
  const sectionBlock = withBg.blocks[0] as SectionBlock;
  assert.equal(sectionBlock.background?.kind, "color");

  const cleared = patchBlockBackground(withBg, "section-1", undefined);
  const clearedSection = cleared.blocks[0] as SectionBlock;
  assert.equal("background" in clearedSection, false);
});

test("applyBlockStyleById patches nested packages block in section", () => {
  const packages: PackagesBlock = {
    id: "pkg-1",
    type: "packages",
    currency: "AUD",
    tiers: [],
  };
  const sectionWithPkg: SectionBlock = {
    id: "section-2",
    type: "section",
    children: [packages],
  };
  const pkgDoc: ProposalDocument = {
    title: "Pkg",
    blocks: [sectionWithPkg],
  };
  const next = applyBlockStyleById(pkgDoc, "pkg-1", { variant: "visual" });
  const child = (next.blocks[0] as SectionBlock).children[0] as PackagesBlock;
  assert.equal(child.style?.variant, "visual");
});
