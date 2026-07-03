"use client";

import * as React from "react";

import { useDocumentEditorOptional } from "@/components/features/proposal/editor/document-editor-context";
import { documentEditorReducer } from "@/lib/proposal/document-store";
import type { BlockStyle, ProposalBlock, ProposalDocument, SectionBackground } from "@/types/proposal";

export interface ProposalDocumentEditorState {
  document: ProposalDocument;
  blocks: ProposalBlock[];
  updateBlock: (id: string, block: ProposalBlock) => void;
  removeBlock: (id: string) => void;
  addBlockAt: (block: ProposalBlock, index: number) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  duplicateBlock: (id: string) => void;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
  patchBlockBackground: (id: string, background: SectionBackground | undefined) => void;
  setBlocks: (blocks: ProposalBlock[]) => void;
  replaceBlocks: (updater: (blocks: ProposalBlock[]) => ProposalBlock[]) => void;
  setDocument: (document: ProposalDocument) => void;
}

/**
 * Single source of truth for proposal document blocks — uses `DocumentEditorProvider`
 * when present, otherwise a local reducer (legacy embed paths without the provider).
 */
export function useProposalDocumentEditorState(
  initialDocument: ProposalDocument,
): ProposalDocumentEditorState {
  const editor = useDocumentEditorOptional();
  const [localDocument, localDispatch] = React.useReducer(documentEditorReducer, initialDocument);

  const document = editor?.document ?? localDocument;
  const dispatch = editor?.dispatch ?? localDispatch;

  const updateBlock = React.useCallback(
    (id: string, block: ProposalBlock) => {
      dispatch({ type: "updateBlock", id, block });
    },
    [dispatch],
  );

  const removeBlock = React.useCallback(
    (id: string) => {
      dispatch({ type: "removeBlock", id });
    },
    [dispatch],
  );

  const addBlockAt = React.useCallback(
    (block: ProposalBlock, index: number) => {
      dispatch({ type: "insertRootBlock", index, block });
    },
    [dispatch],
  );

  const moveBlock = React.useCallback(
    (id: string, direction: -1 | 1) => {
      dispatch({ type: "moveRootBlock", id, direction });
    },
    [dispatch],
  );

  const reorderBlocks = React.useCallback(
    (activeId: string, overId: string) => {
      dispatch({ type: "reorderRootBlocks", activeId, overId });
    },
    [dispatch],
  );

  const duplicateBlock = React.useCallback(
    (id: string) => {
      dispatch({ type: "duplicateBlock", id });
    },
    [dispatch],
  );

  const applyBlockStyle = React.useCallback(
    (id: string, style: BlockStyle | undefined) => {
      dispatch({ type: "applyBlockStyle", id, style });
    },
    [dispatch],
  );

  const patchBlockBackground = React.useCallback(
    (id: string, background: SectionBackground | undefined) => {
      dispatch({ type: "patchBlockBackground", id, background });
    },
    [dispatch],
  );

  const setBlocks = React.useCallback(
    (blocks: ProposalBlock[]) => {
      dispatch({ type: "setBlocks", blocks });
    },
    [dispatch],
  );

  const replaceBlocks = React.useCallback(
    (updater: (blocks: ProposalBlock[]) => ProposalBlock[]) => {
      dispatch({ type: "setBlocksUpdater", updater });
    },
    [dispatch],
  );

  const setDocument = React.useCallback(
    (next: ProposalDocument) => {
      dispatch({ type: "setDocument", document: next });
    },
    [dispatch],
  );

  return React.useMemo(
    () => ({
      document,
      blocks: document.blocks,
      updateBlock,
      removeBlock,
      addBlockAt,
      moveBlock,
      reorderBlocks,
      duplicateBlock,
      applyBlockStyle,
      patchBlockBackground,
      setBlocks,
      replaceBlocks,
      setDocument,
    }),
    [
      document,
      updateBlock,
      removeBlock,
      addBlockAt,
      moveBlock,
      reorderBlocks,
      duplicateBlock,
      applyBlockStyle,
      patchBlockBackground,
      setBlocks,
      replaceBlocks,
      setDocument,
    ],
  );
}
