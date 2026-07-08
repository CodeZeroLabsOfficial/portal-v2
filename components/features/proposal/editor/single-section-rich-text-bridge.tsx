"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";

interface SingleSectionRichTextEditorContextValue {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const SingleSectionRichTextEditorContext =
  React.createContext<SingleSectionRichTextEditorContextValue | null>(null);

export function SingleSectionRichTextEditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditorState] = React.useState<Editor | null>(null);
  const setEditor = React.useCallback((next: Editor | null) => {
    setEditorState(next);
  }, []);
  const value = React.useMemo(() => ({ editor, setEditor }), [editor, setEditor]);
  return (
    <SingleSectionRichTextEditorContext.Provider value={value}>
      {children}
    </SingleSectionRichTextEditorContext.Provider>
  );
}

export function useSingleSectionRichTextEditor(): SingleSectionRichTextEditorContextValue | null {
  return React.useContext(SingleSectionRichTextEditorContext);
}
