"use client";

import * as React from "react";
import type { BlockMenuProfile } from "@/components/features/proposal/blocks/block-editor-registry";

export const BlockMenuProfileContext = React.createContext<BlockMenuProfile>("proposal");

export function useBlockMenuProfile(): BlockMenuProfile {
  return React.useContext(BlockMenuProfileContext);
}
