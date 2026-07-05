"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TemplateHubKind } from "@/lib/templates/hub-rows";
import { createContractTemplateAction } from "@/server/actions/contract-templates";
import { createProposalTemplateAction } from "@/server/actions/proposal-templates";

export interface NewTemplateButtonGroupProps {
  /** Creates this kind when the main button is clicked. */
  defaultKind: TemplateHubKind;
}

export function NewTemplateButtonGroup({ defaultKind }: NewTemplateButtonGroupProps) {
  const router = useRouter();
  const [busyKind, setBusyKind] = React.useState<TemplateHubKind | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  async function handleCreate(kind: TemplateHubKind) {
    setBusyKind(kind);
    setMenuOpen(false);

    if (kind === "proposal") {
      const res = await createProposalTemplateAction();
      setBusyKind(null);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.push(`/admin/templates/${res.templateId}`);
    } else {
      const res = await createContractTemplateAction();
      setBusyKind(null);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      router.push(`/admin/templates/contracts/${res.contractTemplateId}`);
    }

    router.refresh();
  }

  const isBusy = busyKind !== null;

  return (
    <ButtonGroup>
      <Button
        type="button"
        size="sm"
        disabled={isBusy}
        onClick={() => void handleCreate(defaultKind)}>
        {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
        New Template
      </Button>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            disabled={isBusy}
            aria-label="Choose template type">
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={isBusy}
            onClick={() => void handleCreate("proposal")}>
            Proposal
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={isBusy}
            onClick={() => void handleCreate("contract")}>
            Contract
          </Button>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}
