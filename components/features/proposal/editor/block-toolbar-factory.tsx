"use client";

import * as React from "react";
import { ChevronDown, FileSignature, Pencil, RefreshCw } from "lucide-react";

import { ColumnsBlockToolbarPrimarySlot } from "@/components/proposal/columns-block-layout-controls";
import { ProposalBlockToolbar } from "@/components/proposal/proposal-block-toolbar";
import { ProposalImageBlockToolbar } from "@/components/proposal/proposal-image-block-toolbar";
import { ProposalSectionBackgroundPicker } from "@/components/proposal/proposal-section-background-picker";
import { ProposalSplashBackgroundPickerWithBranding } from "@/components/proposal/proposal-splash-editor";
import { useProposalSectionEditorAppearance } from "@/components/proposal/proposal-section-editor-chrome";
import { ProposalToolbarIconButton } from "@/components/features/proposal/editor/toolbar";
import { getBlockDefinition } from "@/components/features/proposal/blocks/block-editor-registry";
import { useContractTemplatePickerOptional } from "@/components/features/templates/contract-template-picker-provider";
import type { ContractTemplatePick } from "@/lib/templates/contract-template-picker";
import {
  AGREEMENT_SUBSCRIPTION_START_DATE_MODE_OPTIONS,
  defaultAgreementSubscriptionStartCustomDate,
} from "@/lib/agreement/subscription-start-date";
import { packagesAddonsSectionActive } from "@/lib/proposal/commerce/packages-totals";
import { proposalToolbarAuxTextButtonClasses } from "@/lib/proposal/editor-toolbar-tokens";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type {
  AgreementBlock,
  AgreementSubscriptionStartDateMode,
  BlockStyle,
  ColumnsBlock,
  ImageBlock,
  PackagesBlock,
  ProposalBlock,
  SectionBackground,
  SplashBlock,
} from "@/types/proposal";

export function blockLabel(type: ProposalBlock["type"]): string {
  return getBlockDefinition(type)?.label ?? "Block";
}

export type BlockToolbarScope = "root" | "section-child";

export interface BlockToolbarFactoryProps {
  scope: BlockToolbarScope;
  block: ProposalBlock;
  index: number;
  count: number;
  /** Root scope only — sortable drag handle rendered as the toolbar's leading slot. */
  dragHandle?: React.ReactNode;
  update: (next: ProposalBlock) => void;
  remove: () => void;
  move: (direction: -1 | 1) => void;
  duplicate: () => void;
  getBlockStyle: (b: ProposalBlock) => BlockStyle | undefined;
  applyBlockStyle: (id: string, style: BlockStyle | undefined) => void;
  /** Section/packages/agreement backdrop change (undefined clears the backdrop). */
  onPatchBackground?: (next: SectionBackground | undefined) => void;
  columnsLayout?: {
    editing: boolean;
    onStartEdit: () => void;
    onEndEdit: () => void;
  };
}

/**
 * Builds the floating toolbar for a block row — single source for the root canvas and
 * the section/agreement child stacks (scope drives the chrome differences).
 */
export function BlockToolbarForBlock({
  scope,
  block,
  index,
  count,
  dragHandle,
  update,
  remove,
  move,
  duplicate,
  getBlockStyle,
  applyBlockStyle,
  onPatchBackground,
  columnsLayout,
}: BlockToolbarFactoryProps): React.ReactNode {
  const isRoot = scope === "root";
  const isSection = block.type === "section";
  const supportsStyle = block.type === "packages" || block.type === "pricing";
  const compactColumnsChrome = block.type === "columns";

  if (block.type === "image") {
    const imageToolbar = (
      <ProposalImageBlockToolbar
        variant="shell"
        block={block as ImageBlock}
        onChange={(next) => update(next)}
        onDelete={remove}
      />
    );
    if (isRoot && dragHandle) {
      return (
        <div className="flex w-full items-start justify-between gap-1.5">
          {dragHandle}
          {imageToolbar}
        </div>
      );
    }
    return imageToolbar;
  }

  const backdropPickerSlot = (() => {
    if (block.type === "splash") {
      return (
        <ProposalSplashBackgroundPickerWithBranding
          block={block as SplashBlock}
          onChange={(next) => update(next)}
        />
      );
    }
    if (!onPatchBackground) return undefined;
    if (block.type === "packages" || (isRoot && (block.type === "section" || block.type === "agreement"))) {
      const background =
        block.type === "section"
          ? block.background
          : (block as PackagesBlock | AgreementBlock).background;
      return (
        <ProposalSectionBackgroundPicker background={background} onChange={onPatchBackground} />
      );
    }
    return undefined;
  })();

  const agreementAux =
    block.type === "agreement" ? (
      <AgreementToolbarAgreementAux
        block={block as AgreementBlock}
        onChange={(next) => update(next)}
      />
    ) : null;

  const packagesAddonsActive =
    block.type === "packages" && packagesAddonsSectionActive(block as PackagesBlock);
  const removeAddons = () => {
    const p = block as PackagesBlock;
    update({ ...p, addonsSectionEnabled: false });
  };

  const auxiliarySlot = (() => {
    if (isRoot) return agreementAux ?? undefined;
    const packagesSlot = packagesAddonsActive ? (
      <PackagesRemoveAddonsButton onClick={removeAddons} />
    ) : null;
    if (!agreementAux && !packagesSlot) return undefined;
    return (
      <span className="inline-flex flex-wrap items-center gap-1">
        {agreementAux}
        {packagesSlot}
      </span>
    );
  })();

  return (
    <ProposalBlockToolbar
      blockType={
        block.type === "pricing"
          ? "pricing"
          : block.type === "packages"
            ? "packages"
            : block.type === "agreement"
              ? "agreement"
              : isRoot && isSection
                ? "section"
                : "other"
      }
      deleteLabel={isRoot ? (isSection ? "Remove section" : "Delete block") : "Remove block"}
      canMoveUp={index > 0}
      canMoveDown={index < count - 1}
      onMoveUp={() => move(-1)}
      onMoveDown={() => move(1)}
      onDuplicate={duplicate}
      onDelete={remove}
      compactChrome={compactColumnsChrome}
      compactPrimarySlot={
        compactColumnsChrome && columnsLayout ? (
          <ColumnsBlockToolbarPrimarySlot
            block={block as ColumnsBlock}
            editing={columnsLayout.editing}
            onStartEdit={columnsLayout.onStartEdit}
            onEndEdit={columnsLayout.onEndEdit}
            onPatch={(patch) => {
              if (block.type !== "columns") return;
              update({ ...block, ...patch });
            }}
          />
        ) : undefined
      }
      overflowLeadingAction={
        isRoot && packagesAddonsActive
          ? { label: "Remove add-ons table", onClick: removeAddons }
          : undefined
      }
      auxiliarySlot={auxiliarySlot}
      showOverflowMenu={isRoot && !isSection && block.type !== "splash"}
      style={supportsStyle ? getBlockStyle(block) : undefined}
      onStyleChange={supportsStyle ? (next) => applyBlockStyle(block.id, next) : undefined}
      backdropPickerSlot={backdropPickerSlot}
      leadingSlot={isRoot ? dragHandle : undefined}
      trailingSlot={undefined}
    />
  );
}

function applyContractTemplatePickToAgreementBlock(
  block: AgreementBlock,
  pick: ContractTemplatePick,
): AgreementBlock {
  const snapshot = {
    agreementTitle: pick.agreementTitle.trim() || "Services Agreement",
    introHtml: pick.introHtml.trim() || undefined,
    legalHtml: pick.legalHtml ?? "",
  };
  return {
    ...block,
    contractTemplateId: pick.id,
    contractTemplateLabel: pick.name.trim() || undefined,
    agreementTitle: snapshot.agreementTitle,
    introHtml: snapshot.introHtml,
    legalHtml: snapshot.legalHtml.trim() ? snapshot.legalHtml : undefined,
  };
}

function PackagesRemoveAddonsButton({ onClick }: { onClick: () => void }) {
  const appearance = useProposalSectionEditorAppearance();
  return (
    <Tooltip delayDuration={320}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={proposalToolbarAuxTextButtonClasses(appearance, { compact: true })}
          onClick={onClick}
          aria-label="Remove add-ons table"
        >
          Remove add-ons
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Remove the add-ons sub-table from this Packages block
      </TooltipContent>
    </Tooltip>
  );
}

function AgreementBubbleEditMenu({
  block,
  onApplyPick,
}: {
  block: AgreementBlock;
  onApplyPick: (next: AgreementBlock) => void;
}) {
  const appearance = useProposalSectionEditorAppearance();
  const contractTemplatePicker = useContractTemplatePickerOptional();
  if (!contractTemplatePicker) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={proposalToolbarAuxTextButtonClasses(appearance)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Edit agreement
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="min-w-[11rem]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={(e) => {
            e.stopPropagation();
            contractTemplatePicker.openPicker({
              onSelect: (pick) => onApplyPick(applyContractTemplatePickToAgreementBlock(block, pick)),
              includeContractTemplateId: block.contractTemplateId?.trim() || undefined,
              currentContractTemplateId: block.contractTemplateId?.trim() || undefined,
            });
          }}
        >
          <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
          Change agreement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AgreementEsignatureSettingsPopover({
  block,
  onChange,
}: {
  block: AgreementBlock;
  onChange: (next: AgreementBlock) => void;
}) {
  const esignOn = block.eSignaturesEnabled !== false;
  const paymentDetailsOn = block.paymentDetailsSectionEnabled !== false;
  const subscriptionStartMode = block.subscriptionStartDateMode ?? "on_acceptance";
  const subscriptionStartCustom =
    block.subscriptionStartCustomDate?.trim() || defaultAgreementSubscriptionStartCustomDate();
  const electronicOn = block.electronicSignatureDisclaimerEnabled !== false;
  const termsDisclaimerOn = block.termsReadDisclaimerEnabled !== false;
  const requireTermsAck = block.requireAcceptTerms !== false;
  const bid = block.id;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ProposalToolbarIconButton
          aria-label="E-signature and acceptance settings"
          tooltip="E-signature & acceptance"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <FileSignature className="h-4 w-4 shrink-0" aria-hidden />
        </ProposalToolbarIconButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={32}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[min(32rem,80vh)] overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                E-signatures
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                When enabled, signers can add a drawn or typed signature. When off, they accept with name and email
                only.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Label htmlFor={`agreement-esign-${bid}`} className="cursor-pointer text-sm font-medium">
                  Enable e-sign
                </Label>
                <Switch
                  id={`agreement-esign-${bid}`}
                  checked={esignOn}
                  onCheckedChange={(checked) => onChange({ ...block, eSignaturesEnabled: checked })}
                />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Payment</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                Show or hide the Add payment details step before signing. Turn off to hide that step (acceptance is
                still recorded; the in-modal subscription setup is skipped).
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Label
                  htmlFor={`agreement-payment-details-${bid}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  Add payment details
                </Label>
                <Switch
                  id={`agreement-payment-details-${bid}`}
                  checked={paymentDetailsOn}
                  onCheckedChange={(checked) => onChange({ ...block, paymentDetailsSectionEnabled: checked })}
                />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                Subscription start date
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                When a subscription is created after acceptance (payment details in modal or staff follow-up),
                this sets the Stripe schedule start date — same options as Add subscription on the Subscriptions
                page.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`agreement-sub-start-mode-${bid}`} className="text-sm font-medium">
                    Start date
                  </Label>
                  <select
                    id={`agreement-sub-start-mode-${bid}`}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={subscriptionStartMode}
                    onChange={(e) => {
                      const mode = e.target.value as AgreementSubscriptionStartDateMode;
                      onChange({
                        ...block,
                        subscriptionStartDateMode: mode,
                        ...(mode === "custom" && !block.subscriptionStartCustomDate
                          ? { subscriptionStartCustomDate: defaultAgreementSubscriptionStartCustomDate() }
                          : {}),
                      });
                    }}
                  >
                    {AGREEMENT_SUBSCRIPTION_START_DATE_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {subscriptionStartMode === "custom" ? (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`agreement-sub-start-custom-${bid}`} className="text-sm font-medium">
                      Custom date
                    </Label>
                    <Input
                      id={`agreement-sub-start-custom-${bid}`}
                      type="date"
                      className="h-9"
                      value={subscriptionStartCustom}
                      onChange={(e) =>
                        onChange({
                          ...block,
                          subscriptionStartCustomDate: e.target.value,
                          subscriptionStartDateMode: "custom",
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                Prefilled fields
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                When enabled and the proposal is linked to a CRM customer, the buyer&apos;s name, email, and
                organisation from that customer record are pre-filled in the accept flow.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`agreement-prefill-name-${bid}`} className="cursor-pointer text-sm font-medium">
                    Name
                  </Label>
                  <Switch
                    id={`agreement-prefill-name-${bid}`}
                    checked={Boolean(block.prefillSignerNameEnabled)}
                    onCheckedChange={(checked) => onChange({ ...block, prefillSignerNameEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`agreement-prefill-email-${bid}`} className="cursor-pointer text-sm font-medium">
                    Email
                  </Label>
                  <Switch
                    id={`agreement-prefill-email-${bid}`}
                    checked={Boolean(block.prefillSignerEmailEnabled)}
                    onCheckedChange={(checked) => onChange({ ...block, prefillSignerEmailEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor={`agreement-prefill-org-${bid}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    Organisation
                  </Label>
                  <Switch
                    id={`agreement-prefill-org-${bid}`}
                    checked={Boolean(block.prefillSignerOrganizationEnabled)}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, prefillSignerOrganizationEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground">Disclaimer</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                Optional acknowledgements shown in the accept flow before signing.
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor={`agreement-disclaimer-esign-${bid}`}
                    className="cursor-pointer text-sm font-medium leading-snug"
                  >
                    E-Signature legal acknowledgment
                  </Label>
                  <Switch
                    id={`agreement-disclaimer-esign-${bid}`}
                    checked={electronicOn}
                    onCheckedChange={(checked) =>
                      onChange({ ...block, electronicSignatureDisclaimerEnabled: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor={`agreement-disclaimer-terms-${bid}`}
                      className="cursor-pointer text-sm font-medium leading-snug"
                    >
                      Agreement to terms acknowledgement
                    </Label>
                    <Switch
                      id={`agreement-disclaimer-terms-${bid}`}
                      checked={termsDisclaimerOn}
                      onCheckedChange={(checked) =>
                        onChange({ ...block, termsReadDisclaimerEnabled: checked })
                      }
                    />
                  </div>
                  {termsDisclaimerOn ? (
                    <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                      <Label
                        htmlFor={`agreement-require-terms-${bid}`}
                        className="cursor-pointer text-sm font-medium text-muted-foreground"
                      >
                        Require acknowledgement
                      </Label>
                      <Switch
                        id={`agreement-require-terms-${bid}`}
                        checked={requireTermsAck}
                        onCheckedChange={(checked) => onChange({ ...block, requireAcceptTerms: checked })}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AgreementToolbarAgreementAux({
  block,
  onChange,
}: {
  block: AgreementBlock;
  onChange: (next: AgreementBlock) => void;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <AgreementBubbleEditMenu block={block} onApplyPick={onChange} />
      <AgreementEsignatureSettingsPopover block={block} onChange={onChange} />
    </span>
  );
}
