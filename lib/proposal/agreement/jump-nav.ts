import type { RefObject } from "react";

import { defaultAgreementLegalNavItems } from "@/lib/proposal/agreement/default-legal-sections";
import {
  AGREEMENT_PLAN_SECTION_ID,
  AGREEMENT_SIGN_SECTION_ID,
  AGREEMENT_SUMMARY_SECTION_ID,
  AGREEMENT_TOP_ANCHOR_ID,
} from "@/lib/proposal/agreement/modal-layout";

export type AgreementJumpNavChild = { id: string; label: string };

export type AgreementJumpLink = { kind: "link"; id: string; label: string };
export type AgreementJumpGroup = {
  kind: "group";
  id: string;
  label: string;
  children: AgreementJumpNavChild[];
};
export type AgreementJumpItem = AgreementJumpLink | AgreementJumpGroup;

/** Inset from the top of the modal scroll pane (header is outside this pane). */
const AGREEMENT_SCROLL_PADDING_PX = 12;

export function scrollAgreementContainerToElement(
  container: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior = "smooth",
) {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextTop =
    targetRect.top - containerRect.top + container.scrollTop - AGREEMENT_SCROLL_PADDING_PX;
  container.scrollTo({ top: Math.max(0, nextTop), behavior });
}

export function jumpToAgreementSection(
  container: HTMLElement | null,
  sectionId: string,
  behavior: ScrollBehavior = "smooth",
) {
  if (!container) return;
  const el = container.querySelector(`#${CSS.escape(sectionId)}`);
  if (el instanceof HTMLElement) {
    scrollAgreementContainerToElement(container, el, behavior);
  }
}

export function scrollAgreementContainerToRef(
  container: HTMLElement | null,
  targetRef: RefObject<HTMLElement | null>,
  behavior: ScrollBehavior = "smooth",
) {
  const el = targetRef.current;
  if (container && el) {
    scrollAgreementContainerToElement(container, el, behavior);
  }
}

/** Intro + legal headings grouped under the agreement title in the jump nav. */
export function buildAgreementLegalNavChildren(options: {
  introHeadings?: AgreementJumpNavChild[];
  legalHeadings?: AgreementJumpNavChild[];
  hasCustomLegal: boolean;
}): AgreementJumpNavChild[] {
  const intro = options.introHeadings ?? [];
  const legal = options.hasCustomLegal
    ? (options.legalHeadings ?? [])
    : defaultAgreementLegalNavItems();
  return [...intro, ...legal];
}

export function buildBuyerAgreementJumpNavItems(options: {
  agreementTitle: string;
  hasPackageSummaries: boolean;
  legalChildren: AgreementJumpNavChild[];
  accepted: boolean;
}): AgreementJumpItem[] {
  const items: AgreementJumpItem[] = [
    { kind: "link", id: AGREEMENT_TOP_ANCHOR_ID, label: "Top of agreement" },
  ];
  if (options.hasPackageSummaries) {
    items.push({
      kind: "link",
      id: AGREEMENT_PLAN_SECTION_ID,
      label: "Selected plan & add-ons",
    });
  }
  items.push({
    kind: "group",
    id: "agreement-legal",
    label: options.agreementTitle,
    children: options.legalChildren,
  });
  items.push({
    kind: "link",
    id: AGREEMENT_SIGN_SECTION_ID,
    label: options.accepted ? "Signature" : "Sign agreement",
  });
  return items;
}

export function buildStaffAgreementJumpNavItems(options: {
  agreementTitle: string;
  legalChildren: AgreementJumpNavChild[];
}): AgreementJumpItem[] {
  return [
    { kind: "link", id: AGREEMENT_TOP_ANCHOR_ID, label: "Top of agreement" },
    {
      kind: "link",
      id: AGREEMENT_SUMMARY_SECTION_ID,
      label: "Agreement summary",
    },
    {
      kind: "group",
      id: "agreement-legal",
      label: options.agreementTitle,
      children: options.legalChildren,
    },
  ];
}
