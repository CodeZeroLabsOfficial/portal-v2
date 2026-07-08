"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";

interface ProposalSingleLayoutRichTextContextValue {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const ProposalSingleLayoutRichTextContext =
  React.createContext<ProposalSingleLayoutRichTextContextValue | null>(null);

/** Shares the TipTap editor between single-layout rich-text fields and the band toolbar stack. */
export function ProposalSingleLayoutRichTextProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditorState] = React.useState<Editor | null>(null);
  const setEditor = React.useCallback((next: Editor | null) => {
    setEditorState(next);
  }, []);
  const value = React.useMemo(() => ({ editor, setEditor }), [editor, setEditor]);
  return (
    <ProposalSingleLayoutRichTextContext.Provider value={value}>
      {children}
    </ProposalSingleLayoutRichTextContext.Provider>
  );
}

export function useProposalSingleLayoutRichTextEditor(): ProposalSingleLayoutRichTextContextValue {
  const ctx = React.useContext(ProposalSingleLayoutRichTextContext);
  if (!ctx) {
    throw new Error(
      "useProposalSingleLayoutRichTextEditor must be used within ProposalSingleLayoutRichTextProvider",
    );
  }
  return ctx;
}

export function useProposalSingleLayoutRichTextEditorOptional(): ProposalSingleLayoutRichTextContextValue | null {
  return React.useContext(ProposalSingleLayoutRichTextContext);
}
