import type { Extensions } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

import {
  FontWeight,
  ProposalBlockTypography,
} from "@/lib/proposal/rich-text/tiptap-typography";

export interface ProposalRichTextExtensionOptions {
  placeholder?: string;
}

/** Shared TipTap extension stack for proposal rich text and round-trip tests. */
export function createProposalRichTextExtensions(
  options: ProposalRichTextExtensionOptions = {},
): Extensions {
  const { placeholder = "Write your section…" } = options;

  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
      link: false,
    }),
    TextStyle,
    Color.configure({ types: ["textStyle"] }),
    FontSize,
    FontFamily,
    FontWeight,
    ProposalBlockTypography,
    TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right"] }),
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    Image.configure({
      inline: true,
      allowBase64: false,
    }),
    Placeholder.configure({ placeholder }),
  ];
}

export interface CrmNoteExtensionOptions {
  placeholder?: string;
}

/** Lightweight extension stack for CRM notes (no custom proposal typography). */
export function createCrmNoteExtensions(options: CrmNoteExtensionOptions = {}): Extensions {
  const { placeholder = "Enter note description..." } = options;

  return [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      link: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-primary underline underline-offset-2" },
    }),
    Placeholder.configure({ placeholder }),
  ];
}
