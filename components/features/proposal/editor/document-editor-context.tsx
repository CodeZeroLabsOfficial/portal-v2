"use client";

import * as React from "react";

import {
  documentEditorReducer,
  type DocumentEditorAction,
} from "@/lib/proposal/document-store";
import type { ProposalDocument } from "@/types/proposal";

export interface DocumentEditorContextValue {
  document: ProposalDocument;
  dispatch: React.Dispatch<DocumentEditorAction>;
  setDocument: (document: ProposalDocument) => void;
  updateBlock: (id: string, block: import("@/types/proposal").ProposalBlock) => void;
}

const DocumentEditorContext = React.createContext<DocumentEditorContextValue | null>(null);

export interface DocumentEditorProviderProps {
  initialDocument: ProposalDocument;
  children: React.ReactNode;
}

export function DocumentEditorProvider({ initialDocument, children }: DocumentEditorProviderProps) {
  const [document, dispatch] = React.useReducer(documentEditorReducer, initialDocument);

  const value = React.useMemo<DocumentEditorContextValue>(
    () => ({
      document,
      dispatch,
      setDocument: (next) => dispatch({ type: "setDocument", document: next }),
      updateBlock: (id, block) => dispatch({ type: "updateBlock", id, block }),
    }),
    [document],
  );

  return (
    <DocumentEditorContext.Provider value={value}>{children}</DocumentEditorContext.Provider>
  );
}

export function useDocumentEditor(): DocumentEditorContextValue {
  const ctx = React.useContext(DocumentEditorContext);
  if (!ctx) {
    throw new Error("useDocumentEditor must be used within DocumentEditorProvider");
  }
  return ctx;
}

export function useDocumentEditorOptional(): DocumentEditorContextValue | null {
  return React.useContext(DocumentEditorContext);
}
