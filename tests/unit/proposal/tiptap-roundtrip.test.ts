import assert from "node:assert/strict";
import test from "node:test";
import { Editor } from "@tiptap/core";
import { JSDOM } from "jsdom";

import { createProposalRichTextExtensions } from "@/lib/proposal/rich-text/tiptap-extensions";
import { proposalRichHtmlToPlainText } from "@/lib/proposal/rich-text/rich-plain-text";
import { sanitizeProposalHtml } from "@/lib/proposal/sanitize";

let domReady = false;

function ensureTipTapTestDom(): void {
  if (domReady || (typeof globalThis.document !== "undefined" && globalThis.document.body)) {
    domReady = true;
    return;
  }
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
  const { window } = dom;
  globalThis.window = window as unknown as Window & typeof globalThis.window;
  globalThis.document = window.document;
  globalThis.Node = window.Node;
  globalThis.HTMLElement = window.HTMLElement;
  domReady = true;
}

function roundTripProposalRichTextHtml(input: string): string {
  ensureTipTapTestDom();
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: createProposalRichTextExtensions({ placeholder: "…" }),
    content: input.trim() || "<p></p>",
  });
  const output = editor.getHTML();
  editor.destroy();
  return output;
}

function normalizeProposalRichTextHtml(html: string): string {
  return html
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim()
    .replace(/ style="([^"]*)"/g, (_match, raw: string) => {
      const decls = raw
        .split(";")
        .map((d: string) => d.trim())
        .filter(Boolean)
        .map((d: string) => {
          const idx = d.indexOf(":");
          if (idx <= 0) return d;
          const prop = d.slice(0, idx).trim().toLowerCase();
          const val = d.slice(idx + 1).trim();
          return `${prop}: ${val}`;
        })
        .sort()
        .join("; ");
      return decls ? ` style="${decls}"` : "";
    });
}

function htmlIncludesStyles(html: string, required: Record<string, string>): boolean {
  const normalized = normalizeProposalRichTextHtml(html).toLowerCase();
  return Object.entries(required).every(([prop, val]) =>
    normalized.includes(`${prop.toLowerCase()}: ${val.toLowerCase()}`),
  );
}

function fixturePlainText(html: string): string {
  return proposalRichHtmlToPlainText(html, { maxLength: 0 });
}

const FIXTURES = {
  plainParagraph:
    "<p>Body copy with <strong>bold</strong>, <em>italic</em>, and plain text.</p>",
  headings: "<h1>Title</h1><h2>Subtitle</h2><h3>Heading</h3><h4>Subheading</h4>",
  blockquote: "<blockquote><p>Pull quote text</p></blockquote>",
  inlineMarks: "<p><strong>B</strong> <em>I</em> <u>U</u> <s>S</s></p>",
  fontMarks:
    '<p><span style="font-family: Inter, sans-serif; font-size: 18px; font-weight: 600">Styled run</span></p>',
  blockTypography:
    '<p style="line-height: 1.4; margin-top: 0.5em; margin-bottom: 0.25em; letter-spacing: 0.02em; text-transform: uppercase">Block rhythm</p>',
  textAlign:
    '<p style="text-align: center">Centered</p><h2 style="text-align: right">Right heading</h2>',
  lists:
    "<ul><li>One <strong>bold</strong></li><li>Two</li></ul><ol><li>First</li><li>Second</li></ol>",
  link: '<p><a href="https://example.com">Link</a></p>',
  mergeTokens: "<p>Hello {{first_name}}, welcome to {{company}} on {{date}}.</p>",
  mixedRealWorld:
    '<h2 style="text-align: center"><span style="font-size: 28px; font-weight: 600">Proposal for {{company}}</span></h2><p style="line-height: 1.3">We are pleased to present this proposal to {{client}}.</p><ul><li>Scope item one</li><li>Scope item two</li></ul>',
  empty: "<p></p>",
} as const;

for (const [name, html] of Object.entries(FIXTURES)) {
  test(`round-trip preserves content: ${name}`, () => {
    const output = roundTripProposalRichTextHtml(html);
    assert.ok(output.trim().length > 0, "expected non-empty HTML");
    assert.equal(fixturePlainText(output), fixturePlainText(html));
  });

  test(`sanitize accepts round-trip output: ${name}`, () => {
    const output = roundTripProposalRichTextHtml(html);
    const safe = sanitizeProposalHtml(output);
    assert.ok(safe.trim().length > 0 || name === "empty");
    assert.equal(fixturePlainText(safe), fixturePlainText(html));
  });
}

test("round-trip preserves inline font styles", () => {
  const output = roundTripProposalRichTextHtml(FIXTURES.fontMarks);
  assert.ok(
    htmlIncludesStyles(output, {
      "font-family": "Inter, sans-serif",
      "font-size": "18px",
      "font-weight": "600",
    }),
  );
});

test("round-trip preserves block typography styles", () => {
  const output = roundTripProposalRichTextHtml(FIXTURES.blockTypography);
  assert.ok(
    htmlIncludesStyles(output, {
      "line-height": "1.4",
      "margin-top": "0.5em",
      "margin-bottom": "0.25em",
      "letter-spacing": "0.02em",
      "text-transform": "uppercase",
    }),
  );
});

test("round-trip preserves text alignment", () => {
  const output = roundTripProposalRichTextHtml(FIXTURES.textAlign);
  const normalized = normalizeProposalRichTextHtml(output);
  assert.match(normalized, /text-align: center/i);
  assert.match(normalized, /text-align: right/i);
});

test("merge tokens survive round-trip literally", () => {
  const output = roundTripProposalRichTextHtml(FIXTURES.mergeTokens);
  assert.match(output, /\{\{first_name\}\}/);
  assert.match(output, /\{\{company\}\}/);
  assert.match(output, /\{\{date\}\}/);
});

test("https images survive sanitize after round-trip", () => {
  const html = '<p><img src="https://cdn.example.com/logo.png" alt="Logo"></p>';
  const output = roundTripProposalRichTextHtml(html);
  const safe = sanitizeProposalHtml(output);
  assert.match(safe, /src="https:\/\/cdn\.example\.com\/logo\.png"/);
});

test("http images are stripped by sanitize", () => {
  const html = '<p><img src="http://cdn.example.com/logo.png" alt="Logo"></p>';
  const output = roundTripProposalRichTextHtml(html);
  const safe = sanitizeProposalHtml(output);
  assert.doesNotMatch(safe, /src="http:\/\//);
});
