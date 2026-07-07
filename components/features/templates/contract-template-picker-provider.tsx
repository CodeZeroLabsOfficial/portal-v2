"use client";

import * as React from "react";

import { ContractTemplatePickerDialog } from "@/components/features/templates/contract-template-picker-dialog";
import type { ContractTemplatePick } from "@/lib/templates/contract-template-picker";

export interface ContractTemplatePickerOpenParams {
  onSelect: (pick: ContractTemplatePick) => void;
  /** Draft template already linked to this Accept block — included in picker list when unpublished. */
  includeContractTemplateId?: string;
  currentContractTemplateId?: string;
}

interface ContractTemplatePickerContextValue {
  isOpen: boolean;
  activeParams: ContractTemplatePickerOpenParams | null;
  openPicker: (params: ContractTemplatePickerOpenParams) => void;
  close: () => void;
}

const ContractTemplatePickerContext = React.createContext<ContractTemplatePickerContextValue | null>(null);

export function useContractTemplatePickerOptional(): ContractTemplatePickerContextValue | null {
  return React.useContext(ContractTemplatePickerContext);
}

export function ContractTemplatePickerProvider({ children }: { children: React.ReactNode }) {
  const [activeParams, setActiveParams] = React.useState<ContractTemplatePickerOpenParams | null>(null);

  const openPicker = React.useCallback((params: ContractTemplatePickerOpenParams) => {
    setActiveParams(params);
  }, []);

  const close = React.useCallback(() => setActiveParams(null), []);

  const value = React.useMemo<ContractTemplatePickerContextValue>(
    () => ({
      isOpen: activeParams !== null,
      activeParams,
      openPicker,
      close,
    }),
    [activeParams, openPicker, close],
  );

  return (
    <ContractTemplatePickerContext.Provider value={value}>
      {children}
      <ContractTemplatePickerDialog
        open={activeParams !== null}
        includeContractTemplateId={activeParams?.includeContractTemplateId}
        currentContractTemplateId={activeParams?.currentContractTemplateId}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onSelect={(pick) => {
          activeParams?.onSelect(pick);
        }}
      />
    </ContractTemplatePickerContext.Provider>
  );
}
