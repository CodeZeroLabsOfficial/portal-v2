import assert from "node:assert/strict";
import test from "node:test";

import {
  applyBlockStyleById,
  documentEditorReducer,
  insertRootBlockAt,
  mergeNestedCommerceBlockStyles,
  patchBlockBackground,
  removeBlockById,
  reorderRootBlocks,
  updateBlockById,
} from "./document-store";
import type { PackagesBlock, PricingBlock, ProposalBlock, ProposalDocument, SectionBlock, TextBlock } from "@/types/proposal";

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

test("mergeNestedCommerceBlockStyles preserves tableBackground on stale packages content patch", () => {
  const styled: PackagesBlock = {
    id: "pkg-1",
    type: "packages",
    currency: "AUD",
    tiers: [{ id: "t1", name: "Starter", includedUsers: 1, includedLocations: 1, includedAdmins: 0, monthlyCost12Minor: 0, monthlyCost24Minor: 0, features: [] }],
    style: { tableBackground: "#15141F", primaryColor: "#673AB7" },
  };
  const stale: PackagesBlock = {
    id: "pkg-1",
    type: "packages",
    currency: "AUD",
    tiers: [{ id: "t1", name: "Starter Plus", includedUsers: 1, includedLocations: 1, includedAdmins: 0, monthlyCost12Minor: 0, monthlyCost24Minor: 0, features: [] }],
  };
  const merged = mergeNestedCommerceBlockStyles(styled, stale) as PackagesBlock;
  assert.equal(merged.style?.tableBackground, "#15141F");
  assert.equal(merged.tiers[0]?.name, "Starter Plus");
});

test("updateBlock via reducer preserves nested packages style after section child edit", () => {
  const packages: PackagesBlock = {
    id: "pkg-1",
    type: "packages",
    currency: "AUD",
    tiers: [],
    style: { tableBackground: "#15141F" },
  };
  const sectionWithPkg: SectionBlock = {
    id: "section-2",
    type: "section",
    children: [packages],
  };
  let state: ProposalDocument = {
    title: "Pkg",
    blocks: [sectionWithPkg],
  };
  const stalePackages: PackagesBlock = {
    id: "pkg-1",
    type: "packages",
    currency: "AUD",
    tiers: [{ id: "t1", name: "Pro", includedUsers: 5, includedLocations: 1, includedAdmins: 1, monthlyCost12Minor: 1000, monthlyCost24Minor: 900, features: [] }],
  };
  const staleSection: SectionBlock = {
    id: "section-2",
    type: "section",
    children: [stalePackages],
  };
  state = documentEditorReducer(state, { type: "updateBlock", id: "section-2", block: staleSection });
  const child = (state.blocks[0] as SectionBlock).children[0] as PackagesBlock;
  assert.equal(child.style?.tableBackground, "#15141F");
  assert.equal(child.tiers[0]?.name, "Pro");
});

test("updateBlock preserves pricing style on direct root block replace", () => {
  const pricing: PricingBlock = {
    id: "price-1",
    type: "pricing",
    currency: "aud",
    lineItems: [],
    style: { tableBackground: "#0F172A" },
  };
  let state: ProposalDocument = { title: "P", blocks: [pricing] };
  const stale: PricingBlock = {
    id: "price-1",
    type: "pricing",
    currency: "aud",
    lineItems: [{ id: "li-1", label: "Item", unitAmountMinor: 500, quantity: 1 }],
  };
  state = documentEditorReducer(state, { type: "updateBlock", id: "price-1", block: stale });
  const block = state.blocks[0] as PricingBlock;
  assert.equal(block.style?.tableBackground, "#0F172A");
  assert.equal(block.lineItems[0]?.label, "Item");
});
