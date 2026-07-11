"use client";

import * as React from "react";
import { LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProposalTemplatePickerCard } from "@/components/features/templates/proposal-template-picker-card";
import { CatalogCategoryCombobox } from "@/components/shared/catalog-category-combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { useCatalogCategories } from "@/hooks/use-catalog-categories";
import {
  DEFAULT_CATALOG_CATEGORY_ID,
  isCatalogCategoryId,
} from "@/lib/catalog/categories";
import {
  filterProposalTemplatesForPicker,
  proposalTemplateRecordToPickerRow,
  sortProposalTemplatePickerRows,
} from "@/lib/templates/proposal-template-picker";
import {
  createDraftProposalFromCustomerAction,
  createDraftProposalFromOpportunityAction,
} from "@/server/actions/proposals-crm";
import type { ProposalTemplateRecord } from "@/types/proposal-template";

export interface AddProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  templates: ProposalTemplateRecord[];
  /** When set, creates a proposal linked to this opportunity (stage + activity side effects). */
  opportunityId?: string;
}

export function AddProposalDialog({
  open,
  onOpenChange,
  customerId,
  templates,
  opportunityId,
}: AddProposalDialogProps) {
  const router = useRouter();
  const [pendingTemplateId, setPendingTemplateId] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState(DEFAULT_CATALOG_CATEGORY_ID);
  const { categories, createCategory } = useCatalogCategories();

  const visible = React.useMemo(
    () =>
      sortProposalTemplatePickerRows(
        filterProposalTemplatesForPicker(templates).map(proposalTemplateRecordToPickerRow),
      ),
    [templates],
  );

  const total = visible.length;
  const from = total === 0 ? 0 : 1;
  const to = total;

  React.useEffect(() => {
    if (!open) {
      setPendingTemplateId(null);
      setCategory(DEFAULT_CATALOG_CATEGORY_ID);
    }
  }, [open]);

  React.useEffect(() => {
    if (categories.length === 0) return;
    if (!categories.some((c) => c.id === category)) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  async function handleUseTemplate(templateId: string) {
    if (pendingTemplateId) return;

    const template = templates.find((t) => t.id === templateId);
    const fromTemplate = template?.catalogMeta?.category?.trim();
    const categoryToUse =
      fromTemplate && isCatalogCategoryId(fromTemplate) ? fromTemplate : category;

    if (!categoryToUse || !isCatalogCategoryId(categoryToUse)) {
      toast.error("Select a product category for this proposal.");
      return;
    }

    if (categoryToUse !== category) {
      setCategory(categoryToUse);
    }

    setPendingTemplateId(templateId);
    try {
      const res = opportunityId
        ? await createDraftProposalFromOpportunityAction(opportunityId, templateId, categoryToUse)
        : await createDraftProposalFromCustomerAction(customerId, templateId, categoryToUse);
      if (!res.ok) {
        toast.error(res.message);
        setPendingTemplateId(null);
        return;
      }
      onOpenChange(false);
      router.push(`/admin/proposals/${res.proposalId}?customer=${encodeURIComponent(customerId)}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create proposal. Please try again.",
      );
      setPendingTemplateId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85dvh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        aria-busy={pendingTemplateId !== null}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>Add proposal</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 space-y-2 border-b px-6 py-4">
          <Label htmlFor="add-proposal-category">
            Product category <span className="text-destructive">*</span>
          </Label>
          <CatalogCategoryCombobox
            id="add-proposal-category"
            className="max-w-sm"
            value={category}
            categories={categories}
            onValueChange={setCategory}
            onCreateCategory={createCategory}
            disabled={pendingTemplateId !== null}
          />
          <p className="text-muted-foreground text-xs">
            Package plans and add-ons in the editor are limited to this category.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {visible.length === 0 ? (
            <Empty className="border py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LayoutTemplate />
                </EmptyMedia>
                <EmptyTitle>No published proposal templates</EmptyTitle>
                <EmptyDescription>
                  Publish a proposal template from Templates, then return here to create a proposal.
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/admin/templates">Open Templates</Link>
              </Button>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((row) => (
                <ProposalTemplatePickerCard
                  key={row.id}
                  row={row}
                  isCreating={pendingTemplateId === row.id}
                  disabled={pendingTemplateId !== null && pendingTemplateId !== row.id}
                  onUse={() => void handleUseTemplate(row.id)}
                />
              ))}
            </div>
          )}
        </div>

        {total > 0 ? (
          <div className="shrink-0 border-t px-6 py-3">
            <p className="text-muted-foreground text-sm">
              Showing {from} to {to} of {total} {total === 1 ? "template" : "templates"}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
