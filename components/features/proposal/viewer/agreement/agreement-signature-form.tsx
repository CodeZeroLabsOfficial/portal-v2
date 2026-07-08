"use client";

import * as React from "react";
import { ChevronRight, CreditCard, Loader2, PenLine, Upload } from "lucide-react";
import { AgreementDisclaimerCheckbox } from "@/components/features/proposal/agreement/disclaimer-checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  normalizeLocalityTimeZone,
  todayIsoDateInTimeZone,
} from "@/lib/proposal/public/locality-dates";
import type { ProposalPublicSubscriptionBillingSnapshot } from "@/lib/schemas/proposal-public-subscription";
import { AGREEMENT_MODAL_ACCEPT_DESCRIPTION_CLASSES, AGREEMENT_MODAL_INK_TEXT_CLASSES } from "@/lib/proposal/public/public-typography";
import { AGREEMENT_MODAL_POPOVER_LIGHT_SURFACE_CLASSES } from "@/lib/proposal/editor-surface-tokens";
import { cn } from "@/lib/utils";
import { ProposalPublicSubscriptionFormPanel } from "@/components/features/proposal/viewer/agreement/public-subscription-form-panel";
import type { ProposalPublicSubscriptionUi } from "@/server/proposal/public-proposal-subscription-ui";
import { acceptProposalPublicAction } from "@/server/actions/proposal-builder";
import { createProposalPublicSubscriptionAction } from "@/server/actions/proposal-public-subscription";
import type { ProposalCustomerSignerPrefill } from "@/types/proposal";

const INK = "#1a1a5e";
const LOGICAL_W = 640;
const LOGICAL_H = 200;

export type AgreementSignatureMethod = "draw" | "type" | "upload";

/** Short US-style date (e.g. 5/14/2026) for the e-signature banner. */
function signatureBannerDateLabel(
  adoptTab: AgreementSignatureMethod,
  localityTimeZone?: string,
): string {
  const tz = normalizeLocalityTimeZone(localityTimeZone);
  const opts: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    ...(tz ? { timeZone: tz } : {}),
  };
  if (adoptTab === "type") {
    const iso = todayIsoDateInTimeZone(localityTimeZone);
    return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", opts);
  }
  return new Date().toLocaleDateString("en-US", opts);
}

function agreementPrefillField(
  enabled: boolean,
  customerValue: string | undefined,
  legacyBlockValue: string | undefined,
): string {
  if (!enabled) return "";
  const fromCustomer = customerValue?.trim();
  if (fromCustomer) return fromCustomer;
  return legacyBlockValue?.trim() ?? "";
}

export interface AgreementSignaturePayload {
  signerName: string;
  signerEmail: string;
  signerOrganization?: string;
  signatureDataUrl?: string;
  signatureMethod?: AgreementSignatureMethod;
  clientSignedAt: number;
}

function getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / Math.max(rect.width, 1)) * LOGICAL_W;
  const y = ((clientY - rect.top) / Math.max(rect.height, 1)) * LOGICAL_H;
  return { x, y };
}

function buildTypedSignatureDataUrl(name: string): string {
  const displayName = name.trim() || " ";
  const fontPx = 56;
  const H = 112;
  const padX = 48;
  const maxTextW = 680;

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  if (!mctx) return "";
  mctx.font = `italic ${fontPx}px "Segoe Script", "Brush Script MT", "Apple Chancery", cursive`;

  let line = displayName;
  if (mctx.measureText(line).width > maxTextW - padX) {
    while (line.length > 1 && mctx.measureText(`${line}…`).width > maxTextW - padX) {
      line = line.slice(0, -1);
    }
    line = `${line}…`;
  }

  const textW = Math.ceil(mctx.measureText(line).width);
  const W = Math.max(160, Math.min(720, textW + padX));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = INK;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `italic ${fontPx}px "Segoe Script", "Brush Script MT", "Apple Chancery", cursive`;
  ctx.fillText(line, W / 2, H / 2 + 2);
  return canvas.toDataURL("image/png");
}

function setupDrawContext(canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  canvas.width = Math.floor(LOGICAL_W * dpr);
  canvas.height = Math.floor(LOGICAL_H * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  canvas.style.maxWidth = `${LOGICAL_W}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return ctx;
}

async function imageFileToPngDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxW = 900;
      const maxH = 280;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (!w || !h) {
        resolve(null);
        return;
      }
      const scale = Math.min(1, maxW / w, maxH / h);
      w = Math.floor(w * scale);
      h = Math.floor(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function AgreementFlowAccordionTrigger({
  icon,
  title,
  subtitle,
  open,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  open: boolean;
  disabled?: boolean;
}) {
  return (
    <CollapsibleTrigger asChild disabled={disabled}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-left shadow-sm transition-colors",
          "hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-800 [&>svg]:size-5">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-slate-700">{title}</span>
          {subtitle ? <span className="mt-0.5 block text-sm text-slate-500">{subtitle}</span> : null}
        </span>
        <ChevronRight
          className={cn("size-5 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-90")}
          aria-hidden
        />
      </button>
    </CollapsibleTrigger>
  );
}

/** Smooth height roll-out / roll-up using CSS grid `0fr` → `1fr` (content stays mounted while collapsed). */
function AgreementAccordionPanel({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid motion-reduce:transition-none",
        "transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden pb-1" inert={!open ? true : undefined}>
        {children}
      </div>
    </div>
  );
}

export interface AgreementSignatureFormProps {
  disabled: boolean;
  busy: boolean;
  /** When false, acceptance does not require a captured signature. Default true. */
  eSignaturesEnabled: boolean;
  /** When true, show and require the electronic-signature binding checkbox (unless disabled). Default true. */
  electronicSignatureDisclaimerEnabled: boolean;
  /** When true, show the “I have read and agree…” checkbox. Default true. */
  termsReadDisclaimerEnabled: boolean;
  /** When {@link termsReadDisclaimerEnabled}, whether that checkbox must be checked. Default true. */
  requireAcceptTerms: boolean;
  prefillSignerNameEnabled: boolean;
  prefillSignerEmailEnabled: boolean;
  prefillSignerOrganizationEnabled: boolean;
  prefillSignerName?: string;
  prefillSignerEmail?: string;
  prefillSignerOrganization?: string;
  /** When set (public page with linked customer), prefill fields prefer these values over legacy block strings. */
  customerSignerPrefill?: ProposalCustomerSignerPrefill | null;
  agreementTitle: string;
  ctaColor: string;
  ctaForeground: string;
  error: string | null;
  /** Called when the user changes inputs so parent can clear server-side error messages. */
  onDismissError?: () => void;
  /** Called after acceptance is recorded (and subscription create attempted when billing applies). */
  onSubmit: (payload: AgreementSignaturePayload, meta?: { subscriptionError?: string | null }) => void | Promise<void>;
  /** Staff Settings → Locality IANA zone (public page uses proposal creator’s saved zone). */
  localityTimeZone?: string;
  shareToken?: string;
  publicSubscriptionUi?: ProposalPublicSubscriptionUi | null;
  stripePublishableKey?: string;
  /**
   * When false, hide subscription card capture in the modal and do not require billing before accept.
   * Default true.
   */
  paymentDetailsSectionEnabled?: boolean;
  /** First packages block monthly total (minor units) for payment header. */
  monthlyTotalMinor?: number;
  monthlyCurrency?: string;
}

export function AgreementSignatureForm({
  disabled,
  busy,
  eSignaturesEnabled,
  electronicSignatureDisclaimerEnabled,
  termsReadDisclaimerEnabled,
  requireAcceptTerms,
  prefillSignerNameEnabled,
  prefillSignerEmailEnabled,
  prefillSignerOrganizationEnabled,
  prefillSignerName,
  prefillSignerEmail,
  prefillSignerOrganization,
  customerSignerPrefill = null,
  agreementTitle,
  ctaColor,
  ctaForeground,
  error,
  onDismissError,
  onSubmit,
  localityTimeZone,
  shareToken,
  publicSubscriptionUi,
  stripePublishableKey,
  paymentDetailsSectionEnabled = true,
  monthlyTotalMinor,
  monthlyCurrency,
}: AgreementSignatureFormProps) {
  const subscriptionBillingInModal = Boolean(
    publicSubscriptionUi && shareToken && paymentDetailsSectionEnabled !== false,
  );

  const [acceptName, setAcceptName] = React.useState(() =>
    agreementPrefillField(
      prefillSignerNameEnabled,
      customerSignerPrefill?.name,
      prefillSignerName,
    ),
  );
  const [acceptEmail, setAcceptEmail] = React.useState(() =>
    agreementPrefillField(
      prefillSignerEmailEnabled,
      customerSignerPrefill?.email,
      prefillSignerEmail,
    ),
  );
  const [acceptOrg, setAcceptOrg] = React.useState(() =>
    agreementPrefillField(
      prefillSignerOrganizationEnabled,
      customerSignerPrefill?.organization,
      prefillSignerOrganization,
    ),
  );

  React.useEffect(() => {
    setAcceptName(
      agreementPrefillField(prefillSignerNameEnabled, customerSignerPrefill?.name, prefillSignerName),
    );
    setAcceptEmail(
      agreementPrefillField(prefillSignerEmailEnabled, customerSignerPrefill?.email, prefillSignerEmail),
    );
    setAcceptOrg(
      agreementPrefillField(
        prefillSignerOrganizationEnabled,
        customerSignerPrefill?.organization,
        prefillSignerOrganization,
      ),
    );
  }, [
    prefillSignerNameEnabled,
    prefillSignerEmailEnabled,
    prefillSignerOrganizationEnabled,
    customerSignerPrefill?.name,
    customerSignerPrefill?.email,
    customerSignerPrefill?.organization,
    prefillSignerName,
    prefillSignerEmail,
    prefillSignerOrganization,
  ]);

  const [adoptOpen, setAdoptOpen] = React.useState(false);
  const [adoptTab, setAdoptTab] = React.useState<AgreementSignatureMethod>("type");
  /** Type-tab only — how the signature *looks*; legal name stays in the Accept form above. */
  const [typedSignatureText, setTypedSignatureText] = React.useState("");
  const [hasInk, setHasInk] = React.useState(false);
  const [canvasReset, setCanvasReset] = React.useState(0);
  const [uploadPreview, setUploadPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [capturedDataUrl, setCapturedDataUrl] = React.useState<string | null>(null);
  const [capturedMethod, setCapturedMethod] = React.useState<AgreementSignatureMethod | null>(null);
  const [signatureBannerDate, setSignatureBannerDate] = React.useState("");

  const [electronicAgreed, setElectronicAgreed] = React.useState(!electronicSignatureDisclaimerEnabled);
  const [termsAgreed, setTermsAgreed] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const [signSectionOpen, setSignSectionOpen] = React.useState(true);
  const [paymentSectionOpen, setPaymentSectionOpen] = React.useState(() => subscriptionBillingInModal);
  const [paymentMethodSummary, setPaymentMethodSummary] = React.useState<string | null>(null);
  const [subscriptionBillingSnapshot, setSubscriptionBillingSnapshot] =
    React.useState<ProposalPublicSubscriptionBillingSnapshot | null>(null);
  const [signingBusy, setSigningBusy] = React.useState(false);

  React.useEffect(() => {
    if (!subscriptionBillingInModal) {
      setPaymentSectionOpen(false);
      setPaymentMethodSummary(null);
      setSubscriptionBillingSnapshot(null);
    }
  }, [subscriptionBillingInModal]);

  const formLocked = busy || signingBusy;
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawingRef = React.useRef(false);
  const lastRef = React.useRef<{ x: number; y: number } | null>(null);
  const adoptPanelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (adoptOpen && adoptPanelRef.current) {
      adoptPanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [adoptOpen]);

  const initCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupDrawContext(canvas);
    setHasInk(false);
    lastRef.current = null;
  }, []);

  React.useLayoutEffect(() => {
    if (!adoptOpen || adoptTab !== "draw") return;
    initCanvas();
  }, [adoptOpen, adoptTab, canvasReset, initCanvas]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || formLocked || adoptTab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const p = getCanvasPoint(canvas, e.clientX, e.clientY);
    lastRef.current = p;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || disabled || formLocked) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const last = lastRef.current;
    if (!canvas || !ctx || !last) return;
    const p = getCanvasPoint(canvas, e.clientX, e.clientY);
    const dist = Math.hypot(p.x - last.x, p.y - last.y);
    if (dist > 0.5) setHasInk(true);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  function clearAdoptSignature() {
    setLocalError(null);
    onDismissError?.();
    if (adoptTab === "draw") {
      setCanvasReset((k) => k + 1);
      return;
    }
    if (adoptTab === "upload") {
      setUploadPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setTypedSignatureText("");
  }

  function openAdoptPanel() {
    if (!eSignaturesEnabled) return;
    setLocalError(null);
    onDismissError?.();
    setSignSectionOpen(true);
    const name = acceptName.trim();
    if (name.length < 2) {
      setLocalError("Please enter your full name before signing.");
      return;
    }
    setTypedSignatureText("");
    setAdoptOpen(true);
  }

  function closeAdoptPanel() {
    setAdoptOpen(false);
    setLocalError(null);
    onDismissError?.();
  }

  function clearCapturedSignature() {
    setLocalError(null);
    onDismissError?.();
    setCapturedDataUrl(null);
    setCapturedMethod(null);
    setSignatureBannerDate("");
    setTypedSignatureText("");
    setUploadPreview(null);
    setHasInk(false);
    setCanvasReset((k) => k + 1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAdoptOpen(false);
  }

  function openAdoptPanelForEdit() {
    if (!eSignaturesEnabled) return;
    setLocalError(null);
    onDismissError?.();
    setSignSectionOpen(true);
    setTypedSignatureText("");
    if (capturedMethod) setAdoptTab(capturedMethod);
    setAdoptOpen(true);
  }

  function handleAdoptAndSign() {
    setLocalError(null);
    onDismissError?.();
    const name = acceptName.trim();
    if (name.length < 2) {
      setLocalError("Please enter your full name.");
      return;
    }
    let dataUrl = "";
    if (adoptTab === "draw") {
      if (!hasInk) {
        setLocalError("Please draw your signature.");
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL("image/png");
    } else if (adoptTab === "type") {
      const sig = typedSignatureText.trim();
      if (sig.length < 2) {
        setLocalError("Please enter your signature.");
        return;
      }
      dataUrl = buildTypedSignatureDataUrl(sig);
    } else {
      if (!uploadPreview || !uploadPreview.startsWith("data:image/png;base64,")) {
        setLocalError("Please upload a signature image.");
        return;
      }
      dataUrl = uploadPreview;
    }
    if (!dataUrl.startsWith("data:image/png;base64,")) {
      setLocalError("Could not capture your signature. Please try again.");
      return;
    }
    setCapturedDataUrl(dataUrl);
    setCapturedMethod(adoptTab);
    setSignatureBannerDate(signatureBannerDateLabel(adoptTab, localityTimeZone));
    setAdoptOpen(false);
    setSignSectionOpen(false);
    if (subscriptionBillingInModal) {
      setPaymentSectionOpen(true);
    }
  }

  async function onUploadFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setLocalError(null);
    onDismissError?.();
    const dataUrl = await imageFileToPngDataUrl(file);
    if (!dataUrl) {
      setLocalError("Could not read that image. Try PNG or JPEG.");
      setUploadPreview(null);
      return;
    }
    setUploadPreview(dataUrl);
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    onDismissError?.();
    const name = acceptName.trim();
    if (name.length < 2) {
      setLocalError("Please enter your full name.");
      return;
    }
    const email = acceptEmail.trim();
    if (!email) {
      setLocalError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    if (!capturedDataUrl || !capturedMethod) {
      if (eSignaturesEnabled) {
        setLocalError("Please add your signature in the e-signature box below.");
        return;
      }
    }
    if (electronicSignatureDisclaimerEnabled && !electronicAgreed) {
      setLocalError("Please confirm that your electronic signature is legally binding.");
      return;
    }
    if (termsReadDisclaimerEnabled && requireAcceptTerms && !termsAgreed) {
      setLocalError("Please confirm you have read and agree to the terms.");
      return;
    }
    if (!shareToken) {
      setLocalError("Signing is not available.");
      return;
    }
    if (subscriptionBillingInModal && !subscriptionBillingSnapshot?.readyToCreateSubscription) {
      setLocalError("Add payment details and save your card before signing the agreement.");
      return;
    }
    const clientSignedAt = Date.now();
    const payload: AgreementSignaturePayload = {
      signerName: name,
      signerEmail: email,
      signerOrganization: acceptOrg.trim() || undefined,
      clientSignedAt,
      ...(eSignaturesEnabled && capturedDataUrl && capturedMethod
        ? { signatureDataUrl: capturedDataUrl, signatureMethod: capturedMethod }
        : {}),
    };
    setSigningBusy(true);
    try {
      const acceptRes = await acceptProposalPublicAction({
        shareToken,
        signerName: payload.signerName,
        signerEmail: payload.signerEmail,
        signerOrganization: payload.signerOrganization,
        signatureDataUrl: payload.signatureDataUrl,
        signatureMethod: payload.signatureMethod,
        clientSignedAt: payload.clientSignedAt,
      });
      if (!acceptRes.ok) {
        setLocalError(acceptRes.message);
        return;
      }
      let subscriptionError: string | null = null;
      if (subscriptionBillingInModal && subscriptionBillingSnapshot?.readyToCreateSubscription) {
        const subRes = await createProposalPublicSubscriptionAction({
          shareToken,
          collectionMethod: subscriptionBillingSnapshot.collectionMethod,
          daysUntilDue:
            subscriptionBillingSnapshot.collectionMethod === "send_invoice"
              ? subscriptionBillingSnapshot.daysUntilDue ?? 14
              : undefined,
          defaultPaymentMethodId:
            subscriptionBillingSnapshot.collectionMethod === "charge_automatically"
              ? subscriptionBillingSnapshot.defaultPaymentMethodId
              : undefined,
        });
        if (!subRes.ok) {
          subscriptionError = subRes.message;
        } else if (subRes.oneOffWarning) {
          subscriptionError = subRes.oneOffWarning;
        }
      }
      await onSubmit(payload, { subscriptionError });
    } catch {
      setLocalError("We could not complete signing. Please try again.");
    } finally {
      setSigningBusy(false);
    }
  }

  const showError = localError || error;
  const emailOk = acceptEmail.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acceptEmail.trim());
  const signatureOk = !eSignaturesEnabled || Boolean(capturedDataUrl && capturedMethod);
  const electronicOk = !electronicSignatureDisclaimerEnabled || electronicAgreed;
  const termsOk =
    !termsReadDisclaimerEnabled || (!requireAcceptTerms || termsAgreed);
  const canFinalSubmit =
    !disabled &&
    !formLocked &&
    acceptName.trim().length >= 2 &&
    emailOk &&
    signatureOk &&
    electronicOk &&
    termsOk &&
    (!subscriptionBillingInModal || Boolean(subscriptionBillingSnapshot?.readyToCreateSubscription));

  const canAdopt =
    eSignaturesEnabled &&
    !disabled &&
    !formLocked &&
    acceptName.trim().length >= 2 &&
    (adoptTab === "draw"
      ? hasInk
      : adoptTab === "type"
        ? typedSignatureText.trim().length >= 2
        : Boolean(uploadPreview));

  return (
    <form className="space-y-5" onSubmit={handleFinalSubmit} noValidate aria-busy={formLocked}>
      <Card className="relative gap-0 py-0 shadow-sm">
        {formLocked ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/85 backdrop-blur-[1px]"
            aria-live="polite"
          >
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-foreground">Signing agreement…</p>
            <p className="mt-1 max-w-[14rem] text-center text-xs text-muted-foreground">
              Please wait while we record your acceptance
              {subscriptionBillingInModal ? " and set up your account." : "."}
            </p>
          </div>
        ) : null}
        <CardContent className={cn("pt-6 sm:pt-8", formLocked && "pointer-events-none opacity-60")}>
          <FieldSet className="mx-auto max-w-md gap-0">
            <h3
              className={cn(
                "text-center text-2xl font-semibold tracking-tight sm:text-[26px]",
                AGREEMENT_MODAL_INK_TEXT_CLASSES,
              )}
            >
              Accept
            </h3>
            <p className={AGREEMENT_MODAL_ACCEPT_DESCRIPTION_CLASSES}>
              To accept this document, fill out the form and click the button below.
            </p>

            <FieldGroup className="mt-8 gap-5">
              <Field>
                <FieldLabel htmlFor="agreement-accept-name">Name</FieldLabel>
                <Input
                  id="agreement-accept-name"
                  autoComplete="name"
                  placeholder="Full name"
                  value={acceptName}
                  onChange={(e) => {
                    onDismissError?.();
                    setAcceptName(e.target.value);
                  }}
                  disabled={disabled || formLocked}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="agreement-accept-email">Email</FieldLabel>
                <Input
                  id="agreement-accept-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  value={acceptEmail}
                  onChange={(e) => {
                    onDismissError?.();
                    setAcceptEmail(e.target.value);
                  }}
                  disabled={disabled || formLocked}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="agreement-accept-org">
                  Organization{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="agreement-accept-org"
                  autoComplete="organization"
                  placeholder="Organization name"
                  value={acceptOrg}
                  onChange={(e) => {
                    onDismissError?.();
                    setAcceptOrg(e.target.value);
                  }}
                  disabled={disabled || formLocked}
                />
              </Field>

              <div className="space-y-3 pt-1">
                {eSignaturesEnabled ? (
                <Collapsible open={signSectionOpen} onOpenChange={setSignSectionOpen}>
                  <AgreementFlowAccordionTrigger
                    icon={<PenLine aria-hidden />}
                    title={capturedDataUrl ? "Signature added" : "Enter your signature"}
                    subtitle={
                      capturedDataUrl
                        ? signatureBannerDate
                          ? `Signed ${signatureBannerDate}`
                          : "Signed"
                        : "Draw, type, or upload your signature"
                    }
                    open={signSectionOpen}
                    disabled={disabled || formLocked}
                  />
                  <CollapsibleContent forceMount>
                  <AgreementAccordionPanel open={signSectionOpen} className={signSectionOpen ? "mt-3" : undefined}>
                    <>
                      <Field>
                      <FieldLabel>E-signature</FieldLabel>
                      {capturedDataUrl ? (
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={disabled || formLocked}
                              className={cn(
                                "group w-full rounded-md border border-input bg-background text-left outline-none transition-colors",
                                "hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                (disabled || formLocked) && "cursor-not-allowed opacity-60",
                              )}
                              aria-label="E-signature options"
                            >
                              <div className="relative px-3 pb-3.5 pt-3">
                                <div className="mb-2 flex min-h-6 w-full items-center justify-between gap-3">
                                  <span className="shrink-0 text-xs font-medium text-muted-foreground">Signed</span>
                                  <span className="min-w-0 shrink truncate text-right text-xs font-medium tabular-nums text-muted-foreground">
                                    {signatureBannerDate || "—"}
                                  </span>
                                </div>
                                <div className="flex h-[7.25rem] max-h-[7.5rem] items-center justify-start overflow-hidden px-1 pt-0.5 sm:h-[7.75rem] sm:max-h-[8rem]">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={capturedDataUrl}
                                    alt=""
                                    className="max-h-full w-auto max-w-full object-contain object-left"
                                  />
                                </div>
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            sideOffset={8}
                            className={cn("z-[100] min-w-[11rem]", AGREEMENT_MODAL_POPOVER_LIGHT_SURFACE_CLASSES)}
                          >
                            <DropdownMenuItem
                              onSelect={() => {
                                clearCapturedSignature();
                              }}
                            >
                              Clear
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                openAdoptPanelForEdit();
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <button
                          type="button"
                          disabled={disabled || formLocked}
                          onClick={openAdoptPanel}
                          className={cn(
                            "w-full rounded-md border border-input bg-background outline-none transition-colors",
                            "hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            (disabled || formLocked) && "cursor-not-allowed opacity-60",
                          )}
                        >
                          <div className="flex min-h-[7.25rem] flex-col items-center justify-center px-4 py-6 sm:min-h-[7.75rem]">
                            <span className="text-lg font-semibold tracking-tight text-foreground">Sign</span>
                          </div>
                        </button>
                      )}
                    </Field>

                    {adoptOpen ? (
                      <div
                        ref={adoptPanelRef}
                        className="mx-auto mt-6 max-w-md border-t border-border pt-8"
                        role="region"
                        aria-label="Adopt your signature"
                      >
                        <FieldLegend className="mb-0 text-xl font-semibold tracking-tight sm:text-2xl">
                          Adopt your signature
                        </FieldLegend>
                        <Tabs
                          value={adoptTab}
                          onValueChange={(value) => {
                            onDismissError?.();
                            setAdoptTab(value as AgreementSignatureMethod);
                            setLocalError(null);
                          }}
                          className="mt-5 gap-5"
                        >
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="type" disabled={disabled || formLocked}>
                              Type
                            </TabsTrigger>
                            <TabsTrigger value="draw" disabled={disabled || formLocked}>
                              Draw
                            </TabsTrigger>
                            <TabsTrigger value="upload" disabled={disabled || formLocked}>
                              Upload
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="draw">
                          <Field>
                            <div className="flex items-center justify-between gap-3">
                              <FieldLabel>Draw your signature</FieldLabel>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearAdoptSignature}
                                disabled={disabled || formLocked}
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="min-h-[min(200px,38svh)] overflow-hidden rounded-md border border-dashed border-input bg-muted/30 sm:min-h-0">
                              <canvas
                                ref={canvasRef}
                                className="block w-full cursor-crosshair touch-none"
                                width={LOGICAL_W}
                                height={LOGICAL_H}
                                onPointerDown={onPointerDown}
                                onPointerMove={onPointerMove}
                                onPointerUp={endStroke}
                                onPointerCancel={endStroke}
                                onPointerLeave={(e) => {
                                  if (e.buttons === 0) endStroke();
                                }}
                              />
                            </div>
                          </Field>
                          </TabsContent>

                          <TabsContent value="type">
                          <FieldGroup className="gap-4">
                            <Field>
                              <div className="flex items-center justify-between gap-3">
                                <FieldLabel htmlFor="agreement-typed-signature">Enter your signature</FieldLabel>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearAdoptSignature}
                                  disabled={disabled || formLocked}
                                >
                                  Clear
                                </Button>
                              </div>
                              <Input
                                id="agreement-typed-signature"
                                autoComplete="off"
                                placeholder="Type your signature"
                                value={typedSignatureText}
                                onChange={(e) => {
                                  onDismissError?.();
                                  setTypedSignatureText(e.target.value);
                                }}
                                disabled={disabled || formLocked}
                              />
                            </Field>
                            <Field>
                              <FieldDescription className="text-xs uppercase tracking-wider">
                                Preview
                              </FieldDescription>
                              <div className="rounded-md border border-input bg-background px-4 py-6 sm:px-6 sm:py-8">
                                <p
                                  className={cn(
                                    "break-words text-3xl leading-snug sm:text-4xl",
                                    typedSignatureText.trim() ? "text-foreground" : "text-muted-foreground",
                                  )}
                                  style={{
                                    fontFamily: '"Segoe Script", "Brush Script MT", "Apple Chancery", cursive',
                                    fontStyle: "italic",
                                  }}
                                >
                                  {typedSignatureText.trim() || "Type your signature"}
                                </p>
                              </div>
                            </Field>
                          </FieldGroup>
                          </TabsContent>

                          <TabsContent value="upload">
                          <Field>
                            <div className="flex items-center justify-between gap-3">
                              <FieldLabel>Upload an image of your signature</FieldLabel>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearAdoptSignature}
                                disabled={disabled || formLocked}
                              >
                                Clear
                              </Button>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              className="sr-only"
                              tabIndex={-1}
                              onChange={(e) => void onUploadFiles(e.target.files)}
                            />
                            <div
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  fileInputRef.current?.click();
                                }
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                void onUploadFiles(e.dataTransfer.files);
                              }}
                              className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-input bg-muted/30 px-4 py-8 text-center transition-colors hover:border-ring/50 hover:bg-muted/50"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {uploadPreview ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={uploadPreview}
                                  alt="Uploaded signature preview"
                                  className="max-h-28 max-w-full object-contain"
                                />
                              ) : (
                                <>
                                  <Upload className="size-8 text-muted-foreground" aria-hidden />
                                  <p className="text-sm text-muted-foreground">
                                    Drag an image here, or{" "}
                                    <span className="font-semibold text-foreground underline">browse</span>
                                  </p>
                                </>
                              )}
                            </div>
                          </Field>
                          </TabsContent>
                        </Tabs>

                        <FieldDescription className="mt-5">
                          By selecting Adopt and sign, I agree that my electronic signature is as valid and legally
                          binding as a handwritten signature.
                        </FieldDescription>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3 sm:justify-stretch">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            onClick={closeAdoptPanel}
                            disabled={disabled || formLocked}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            className="flex-1 hover:opacity-95"
                            style={{ backgroundColor: ctaColor, color: ctaForeground }}
                            onClick={handleAdoptAndSign}
                            disabled={!canAdopt}
                          >
                            Adopt and sign
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    </>
                  </AgreementAccordionPanel>
                  </CollapsibleContent>
                </Collapsible>
                ) : (
                  <Card className="border-border bg-muted/30 py-4 shadow-none">
                    <CardContent className="text-sm leading-relaxed text-muted-foreground">
                    Electronic signatures are turned off for this proposal. Confirm your name and email below — no
                    drawn or typed signature is required.
                    </CardContent>
                  </Card>
                )}

                {subscriptionBillingInModal && publicSubscriptionUi && shareToken ? (
                  <Collapsible open={paymentSectionOpen} onOpenChange={setPaymentSectionOpen}>
                    <AgreementFlowAccordionTrigger
                      icon={<CreditCard aria-hidden />}
                      title="Add payment details"
                      subtitle={
                        paymentMethodSummary
                          ? paymentMethodSummary
                          : "Securely add a card for your subscription"
                      }
                      open={paymentSectionOpen}
                      disabled={disabled || formLocked}
                    />
                    <CollapsibleContent forceMount>
                    <AgreementAccordionPanel
                      open={paymentSectionOpen}
                      className={paymentSectionOpen ? "mt-3" : undefined}
                    >
                      <Card
                        className={cn(
                          "gap-0 py-0 shadow-sm transition-[padding,box-shadow,border-color] duration-300 ease-out motion-reduce:transition-none",
                          paymentSectionOpen ? "border-border" : "border-transparent shadow-none",
                        )}
                      >
                        <CardContent className={paymentSectionOpen ? "pt-4" : "p-0"}>
                        <ProposalPublicSubscriptionFormPanel
                          active={paymentSectionOpen}
                          shareToken={shareToken}
                          ui={publicSubscriptionUi}
                          stripePublishableKey={stripePublishableKey}
                          cardElementId="proposal-accept-flow-subscription-card"
                          mode="save_card_only"
                          monthlyTotalMinor={monthlyTotalMinor}
                          monthlyCurrency={monthlyCurrency}
                          onPaymentSummaryChange={setPaymentMethodSummary}
                          onBillingSnapshotChange={setSubscriptionBillingSnapshot}
                          onCardSaved={() => setPaymentSectionOpen(false)}
                          primaryCtaColor={ctaColor}
                          primaryCtaForeground={ctaForeground}
                        />
                        </CardContent>
                      </Card>
                    </AgreementAccordionPanel>
                    </CollapsibleContent>
                  </Collapsible>
                ) : null}
              </div>
            </FieldGroup>
          </FieldSet>

          <div className="mx-auto mt-8 max-w-md space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
            {electronicSignatureDisclaimerEnabled ? (
              <AgreementDisclaimerCheckbox
                checked={electronicAgreed}
                onCheckedChange={(checked) => {
                  onDismissError?.();
                  setElectronicAgreed(checked);
                }}
                disabled={disabled || formLocked}
                ctaColor={ctaColor}
              >
                I agree that my electronic signature is as valid and legally binding as a handwritten signature.
              </AgreementDisclaimerCheckbox>
            ) : null}
            {termsReadDisclaimerEnabled ? (
              <AgreementDisclaimerCheckbox
                checked={termsAgreed}
                onCheckedChange={(checked) => {
                  onDismissError?.();
                  setTermsAgreed(checked);
                }}
                disabled={disabled || formLocked}
                ctaColor={ctaColor}
              >
                I have read and agree to the terms of this {agreementTitle.toLowerCase()}.
              </AgreementDisclaimerCheckbox>
            ) : null}
          </div>

          {showError ? (
            <p className="mx-auto mt-4 max-w-md text-sm text-destructive" role="alert">
              {showError}
            </p>
          ) : null}

          {!disabled ? null : (
            <p className="mx-auto mt-4 max-w-md text-xs text-muted-foreground">
              Signing is disabled in preview — the live proposal will accept your customer&apos;s signature here.
            </p>
          )}

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 hover:opacity-95"
              style={{ backgroundColor: ctaColor, color: ctaForeground }}
              disabled={!canFinalSubmit}
            >
              {formLocked ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Sign Agreement
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
