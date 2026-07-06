import assert from "node:assert/strict";
import test from "node:test";

import { createProposalBlock } from "@/lib/proposal/block-definitions";
import { countOutlineSections, sectionOutlineLabel } from "./outline-labels";
import type { ProposalBlock, SectionBlock } from "@/types/proposal";

const baseSection = (overrides: Partial<SectionBlock> = {}): SectionBlock => ({
  id: "section-1",
  type: "section",
  children: [],
  ...overrides,
});

test("sectionOutlineLabel prefers explicit title", () => {
  const block = baseSection({
    title: "  Pricing  ",
    children: [{ id: "h1", type: "header", text: "Ignored heading" }],
  });
  assert.equal(sectionOutlineLabel(block, 0), "Pricing");
});

test("sectionOutlineLabel uses first header text", () => {
  const block = baseSection({
    children: [{ id: "h1", type: "header", text: "Our approach" }],
  });
  assert.equal(sectionOutlineLabel(block, 2), "Our approach");
});

test("sectionOutlineLabel strips header html", () => {
  const block = baseSection({
    children: [{ id: "h1", type: "header", text: "", html: "<h2>Scope &amp; timeline</h2>" }],
  });
  assert.equal(sectionOutlineLabel(block, 0), "Scope & timeline");
});

test("sectionOutlineLabel falls back to outline index", () => {
  const block = baseSection();
  assert.equal(sectionOutlineLabel(block, 0), "Section 1");
  assert.equal(sectionOutlineLabel(block, 4), "Section 5");
});

test("countOutlineSections counts only top-level section blocks", () => {
  const blocks: ProposalBlock[] = [
    createProposalBlock("splash"),
    baseSection({ id: "s1" }),
    baseSection({ id: "s2" }),
    createProposalBlock("pricing"),
  ];
  assert.equal(countOutlineSections(blocks), 2);
});

test("countOutlineSections returns zero when no sections", () => {
  const blocks: ProposalBlock[] = [
    { id: "text", type: "text", html: "<p></p>" },
    { id: "header", type: "header", text: "Hello" },
  ];
  assert.equal(countOutlineSections(blocks), 0);
});
