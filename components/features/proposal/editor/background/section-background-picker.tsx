"use client";

import * as React from "react";
import { Check, ImageIcon, Layers, MonitorPlay } from "lucide-react";
import { ProposalToolbarSectionLabel } from "@/components/features/proposal/editor/toolbar";
import {
  type ProposalToolbarAppearance,
  PROPOSAL_TOOLBAR_TOKENS,
  proposalToolbarAssetRowHoverClasses,
  proposalToolbarAssetThumbBorderClasses,
  proposalToolbarBackdropTriggerClasses,
  proposalToolbarLabelMutedClasses,
  proposalToolbarPanelClasses,
  proposalToolbarPanelInputClasses,
  proposalToolbarPanelOutlineButtonClasses,
  proposalToolbarPanelSectionDividerClasses,
  proposalToolbarPreviewSwatchRingClasses,
  proposalToolbarSwatchIdleBorderClasses,
  proposalToolbarSwatchRingOffsetClasses,
  proposalToolbarTabsListClasses,
  proposalToolbarTabsTriggerClasses,
  proposalToolbarTintInputShellClasses,
  proposalToolbarTintPreviewRingClasses,
} from "@/lib/proposal/editor-toolbar-tokens";
import { STYLE_PRESET_COLORS } from "@/lib/proposal/block-style";
import {
  defaultSectionBackground,
  isSectionBackgroundActive,
  mergeSectionBackground,
  resolveSectionBackground,
  type ResolvedSectionBackground,
} from "@/lib/proposal/section-background";
import { cn } from "@/lib/utils";
import type { SectionBackground, SectionBackdropKind } from "@/types/proposal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProposalMediaLibraryOptional } from "@/components/features/proposal/editor/media/proposal-media-library";
import { SectionBackgroundTintPopover } from "@/components/features/proposal/editor/background/background-tint-popover";
import { youtubeThumbnailFromPageUrl } from "@/lib/proposal/media/embed-video";
import { useResolvedProposalToolbarAppearance } from "@/components/features/proposal/editor/section-chrome/proposal-section-editor-chrome";

export interface ProposalSectionBackgroundPickerProps {
  background?: SectionBackground;
  onChange: (next: SectionBackground | undefined) => void;
  appearance?: ProposalToolbarAppearance;
}

export function ProposalSectionBackgroundPicker({
  background,
  onChange,
  appearance: appearanceProp,
}: ProposalSectionBackgroundPickerProps) {
  const appearance = useResolvedProposalToolbarAppearance(appearanceProp);
  const mediaLibrary = useProposalMediaLibraryOptional();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const model = mergeSectionBackground(background, {});
  const resolvedPreview = resolveSectionBackground(model);
  const hasPersistedBackdrop = Boolean(background && isSectionBackgroundActive(background));

  function patch(part: Partial<SectionBackground>) {
    onChange(mergeSectionBackground(background, part));
  }

  function setKind(next: SectionBackdropKind) {
    const base = defaultSectionBackground();
    patch({
      kind: next,
      color: model.color ?? base.color,
      mediaUrl:
        next === "color"
          ? undefined
          : model.mediaUrl && model.kind !== "color"
            ? model.mediaUrl
            : "",
      posterUrl: next === "video" ? (model.kind === "video" ? model.posterUrl : undefined) : undefined,
    });
  }

  const resolvedAppearance = appearance ?? "surface";
  const labelMuted = proposalToolbarLabelMutedClasses(resolvedAppearance);

  const showMediaFill =
    resolvedPreview.active &&
    resolvedPreview.mediaUrl &&
    (resolvedPreview.kind === "image" || resolvedPreview.kind === "video");

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Background"
          aria-label="Background"
          className={proposalToolbarBackdropTriggerClasses(appearance, {
            showMediaFill: Boolean(showMediaFill),
            hasPersistedBackdrop,
          })}
        >
          {showMediaFill ? (
            <SectionBackgroundTriggerMediaFill model={model} preview={resolvedPreview} />
          ) : (
            <>
              <Layers className={cn("h-4 w-4", appearance === "elevated" && !hasPersistedBackdrop && "opacity-90")} />
              <PreviewSwatchMini model={model} appearance={appearance} />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={8}
        className={cn(
          "w-[min(272px,calc(100vw-2rem))] overflow-hidden rounded-lg border p-0",
          proposalToolbarPanelClasses(appearance),
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("[data-background-tint-popover]")) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("[data-background-tint-popover]")) e.preventDefault();
        }}
      >
        <div className={cn("border-b px-3 py-2.5", proposalToolbarPanelSectionDividerClasses(appearance))}>
          <ProposalToolbarSectionLabel appearance={appearance}>
            Background type
          </ProposalToolbarSectionLabel>
          <Tabs
            value={model.kind}
            onValueChange={(v) => setKind(v as SectionBackdropKind)}
            className="mt-2"
          >
            <TabsList
              className={cn(
                "grid h-8 w-full grid-cols-3 items-stretch gap-0 rounded-md border-0 p-0.5 shadow-none",
                proposalToolbarTabsListClasses(appearance),
              )}
            >
              <TabsTrigger
                value="color"
                className={cn(
                  "h-full min-h-0 w-full rounded-[6px] px-2 py-0 font-semibold data-[state=inactive]:text-muted-foreground data-[state=inactive]:shadow-none",
                  PROPOSAL_TOOLBAR_TOKENS.surface.menuItemCompact,
                  proposalToolbarTabsTriggerClasses(appearance),
                )}
              >
                Color
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className={cn(
                  "h-full min-h-0 w-full rounded-[6px] px-2 py-0 font-semibold data-[state=inactive]:text-muted-foreground data-[state=inactive]:shadow-none",
                  PROPOSAL_TOOLBAR_TOKENS.surface.menuItemCompact,
                  proposalToolbarTabsTriggerClasses(appearance),
                )}
              >
                Image
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className={cn(
                  "h-full min-h-0 w-full rounded-[6px] px-2 py-0 font-semibold data-[state=inactive]:text-muted-foreground data-[state=inactive]:shadow-none",
                  PROPOSAL_TOOLBAR_TOKENS.surface.menuItemCompact,
                  proposalToolbarTabsTriggerClasses(appearance),
                )}
              >
                Video
              </TabsTrigger>
            </TabsList>
            <TabsContent value="color" className="mt-2 space-y-2 outline-none">
              <TintSwatchPicker
                appearance={appearance}
                label="Backdrop color"
                value={normalizeHex(model.color) ?? "#0f172a"}
                onChange={(c) => patch({ kind: "color", color: c, mediaUrl: undefined })}
              />
              <SectionBackgroundTintPopover
                appearance={appearance}
                labelMuted={labelMuted}
                tintColor={model.tintColor}
                tintStyle={model.tintStyle}
                tintOpacity={model.tintOpacity}
                blurStrength={model.blurStrength}
                onPatch={patch}
              />
            </TabsContent>
            <TabsContent value="image" className="mt-2 space-y-2 outline-none">
              <MiniAssetRow
                appearance={appearance}
                kind="image"
                url={model.mediaUrl}
                rowTitle="Background image"
                onPickFromLibrary={
                  mediaLibrary
                    ? () => {
                        setMenuOpen(false);
                        window.setTimeout(() => {
                          mediaLibrary.openSelection({
                            allowedKinds: ["image"],
                            onSelect: (asset) => {
                              if (asset.kind !== "image") return;
                              patch({ kind: "image", mediaUrl: asset.downloadUrl });
                            },
                          });
                        }, 0);
                      }
                    : undefined
                }
              />
              <div className="space-y-1 pt-1.5">
                <Label className={cn("text-xs font-semibold uppercase tracking-[0.14em]", labelMuted)}>
                  Image URL
                </Label>
                <Input
                  value={model.mediaUrl ?? ""}
                  onChange={(e) => patch({ kind: "image", mediaUrl: e.target.value })}
                  placeholder="https://…"
                  className={cn("h-8 rounded-md text-xs", proposalToolbarPanelInputClasses(appearance))}
                  spellCheck={false}
                />
              </div>
              <SectionBackgroundTintPopover
                appearance={appearance}
                labelMuted={labelMuted}
                tintColor={model.tintColor}
                tintStyle={model.tintStyle}
                tintOpacity={model.tintOpacity}
                blurStrength={model.blurStrength}
                onPatch={patch}
              />
            </TabsContent>
            <TabsContent value="video" className="mt-2 space-y-1.5 outline-none">
              <MiniAssetRow
                appearance={appearance}
                kind="video"
                url={model.mediaUrl}
                rowTitle="Background video"
                emptyHint="Choose from library"
                onPickFromLibrary={
                  mediaLibrary
                    ? () => {
                        setMenuOpen(false);
                        window.setTimeout(() => {
                          mediaLibrary.openSelection({
                            allowedKinds: ["video"],
                            onSelect: (asset) => {
                              if (asset.kind !== "video") return;
                              patch({ kind: "video", mediaUrl: asset.downloadUrl, posterUrl: undefined });
                            },
                          });
                        }, 0);
                      }
                    : undefined
                }
              />
              <SectionBackgroundTintPopover
                appearance={appearance}
                labelMuted={labelMuted}
                tintColor={model.tintColor}
                tintStyle={model.tintStyle}
                tintOpacity={model.tintOpacity}
                blurStrength={model.blurStrength}
                onPatch={patch}
              />
              <MiniAssetRow
                appearance={appearance}
                kind="image"
                url={model.posterUrl}
                rowTitle="Mobile image fallback"
                emptyHint="Choose from library"
                onPickFromLibrary={
                  mediaLibrary
                    ? () => {
                        setMenuOpen(false);
                        window.setTimeout(() => {
                          mediaLibrary.openSelection({
                            allowedKinds: ["image"],
                            onSelect: (asset) => {
                              if (asset.kind !== "image") return;
                              patch({ kind: "video", posterUrl: asset.downloadUrl });
                            },
                          });
                        }, 0);
                      }
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-3 px-3 py-3">
          <div className={cn("flex flex-wrap gap-2 border-t pt-2", proposalToolbarPanelSectionDividerClasses(appearance))}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-8 flex-1 rounded-md text-xs font-medium",
                proposalToolbarPanelOutlineButtonClasses(appearance),
              )}
              onClick={() => onChange(undefined)}
              disabled={!background}
            >
              Clear background
            </Button>
          </div>
          <p className={cn("text-xs leading-snug", labelMuted)}>
            {resolvedPreview.active
              ? "Shown on preview and shared pages after save."
              : "Pick a backdrop, then tune tint and blur."}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SectionBackgroundTriggerMediaFill({
  model,
  preview,
}: {
  model: SectionBackground;
  preview: ResolvedSectionBackground;
}) {
  const url = preview.mediaUrl;
  if (!url) return null;

  if (preview.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary author URLs
      <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
    );
  }

  const poster = model.posterUrl?.trim();
  if (poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt="" className="h-full w-full object-cover" draggable={false} />
    );
  }
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) {
    return (
      <video className="h-full w-full object-cover" muted playsInline preload="metadata" src={url} aria-hidden />
    );
  }
  const yt = youtubeThumbnailFromPageUrl(url);
  if (yt) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={yt} alt="" className="h-full w-full object-cover" draggable={false} />
    );
  }
  return <span className="block h-full w-full bg-muted" aria-hidden />;
}

function PreviewSwatchMini({
  model,
  appearance,
}: {
  model: SectionBackground;
  appearance?: ProposalToolbarAppearance;
}) {
  const preview = resolveSectionBackground(model);
  const ringFg = proposalToolbarPreviewSwatchRingClasses(appearance ?? "surface");

  let inner: React.ReactNode;
  if (preview.kind === "color" || !preview.active) {
    inner = (
      <span
        className="absolute bottom-1 right-1 h-4 w-4 rounded-full shadow-sm ring-[1.5px]"
        style={{ backgroundColor: preview.colorHex, boxShadow: "inset 0 1px rgba(255,255,255,0.12)" }}
      />
    );
  } else if (preview.kind === "image") {
    inner =
      preview.mediaUrl && preview.active ? (
        <span
          className="absolute bottom-1 right-1 h-4 w-4 overflow-hidden rounded-full ring-[1.5px]"
          style={{
            borderColor: appearance === "elevated" ? "#27272a" : "var(--border)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary author URLs */}
          <img src={preview.mediaUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        </span>
      ) : (
        <span className={cn("absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted ring-[1.5px]", ringFg)}>
          <ImageIcon className="h-2.5 w-2.5 text-muted-foreground" />
        </span>
      );
  } else {
    inner =
      preview.mediaUrl && preview.active ? (
        model.posterUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.posterUrl.trim()}
            alt=""
            className="pointer-events-none absolute bottom-1 right-1 h-4 w-4 rounded-full object-cover ring-[1.5px] ring-neutral-950/80"
            draggable={false}
          />
        ) : (
          <video
            className="pointer-events-none absolute bottom-1 right-1 h-4 w-4 rounded-full object-cover ring-[1.5px] ring-neutral-950/80"
            muted
            playsInline
            preload="metadata"
            src={preview.mediaUrl}
          />
        )
      ) : (
        <span className={cn("absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted ring-[1.5px]", ringFg)}>
          <MonitorPlay className="h-2.5 w-2.5 text-muted-foreground" />
        </span>
      );
  }

  return <span className="pointer-events-none absolute inset-0">{inner}</span>;
}

function MiniAssetRow({
  appearance,
  kind,
  url,
  rowTitle,
  emptyHint,
  onPickFromLibrary,
}: {
  appearance?: ProposalToolbarAppearance;
  kind: "image" | "video";
  url?: string;
  rowTitle?: string;
  emptyHint?: string;
  onPickFromLibrary?: () => void;
}) {
  const resolvedAppearance = appearance ?? "surface";
  const labelMuted = proposalToolbarLabelMutedClasses(resolvedAppearance);
  const trimmed = (url ?? "").trim();
  const titleText = rowTitle ?? `Background ${kind === "image" ? "image" : "video"}`;
  const defaultEmptyHint = onPickFromLibrary ? "Library or paste a HTTPS URL" : "Paste a HTTPS URL";
  const subtitle = trimmed || (emptyHint ?? defaultEmptyHint);
  const rowClass = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left ring-1 ring-border/50 transition-colors",
    onPickFromLibrary && "cursor-pointer hover:bg-muted/35 hover:ring-border/70",
    resolvedAppearance === "elevated" && onPickFromLibrary && proposalToolbarAssetRowHoverClasses(resolvedAppearance),
    !onPickFromLibrary && "bg-muted/10",
  );

  const checkerboard = (
    <span
      className="absolute inset-0 opacity-50"
      style={{
        backgroundImage:
          "linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
        backgroundSize: "5px 5px",
        backgroundPosition: "0 0, 0 2.5px, 2.5px -2.5px, -2.5px 0px",
      }}
      aria-hidden
    />
  );

  const thumb = (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted/20",
        proposalToolbarAssetThumbBorderClasses(appearance ?? "surface"),
      )}
    >
      {!trimmed ? (
        <>
          {checkerboard}
          {kind === "video" ? (
            <MonitorPlay className="relative z-[1] h-4 w-4 text-muted-foreground" aria-hidden />
          ) : null}
        </>
      ) : kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trimmed} alt="" className="relative z-[1] h-full w-full object-cover" draggable={false} />
      ) : (
        <video
          muted
          playsInline
          preload="metadata"
          className="relative z-[1] h-full w-full object-cover"
          src={trimmed}
        />
      )}
    </div>
  );

  const text = (
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold leading-tight text-foreground">{titleText}</p>
      <p className={cn("mt-0.5 truncate text-xs leading-snug", labelMuted)}>{subtitle}</p>
    </div>
  );

  if (onPickFromLibrary) {
    return (
      <button type="button" className={rowClass} onClick={() => onPickFromLibrary()}>
        {thumb}
        {text}
      </button>
    );
  }
  return (
    <div className={rowClass}>
      {thumb}
      {text}
    </div>
  );
}

function TintSwatchPicker({
  appearance,
  label,
  value,
  onChange,
}: {
  appearance?: ProposalToolbarAppearance;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const resolvedAppearance = appearance ?? "surface";
  const labelMuted = proposalToolbarLabelMutedClasses(resolvedAppearance);
  const ringActive = proposalToolbarSwatchRingOffsetClasses(appearance ?? "surface");
  const swatchIdle = proposalToolbarSwatchIdleBorderClasses(appearance ?? "surface");

  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  function commitDraft() {
    const n = normalizeHex(draft.trim());
    if (n) onChange(n);
    else setDraft(value);
  }

  return (
    <div>
      {label ? (
        <p className={cn("mb-1.5 text-xs font-semibold uppercase tracking-[0.14em]", labelMuted)}>{label}</p>
      ) : null}
      <div className="grid grid-cols-6 gap-1.5">
        {STYLE_PRESET_COLORS.map((c) => {
          const isActive = sameHex(c.value, value);
          return (
            <button
              key={c.value}
              type="button"
              aria-label={c.label}
              title={c.label}
              className={cn(
                "relative h-7 w-7 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isActive ? cn("ring-2 ring-ring ring-offset-1", ringActive) : swatchIdle,
              )}
              style={{ backgroundColor: c.value }}
              onClick={() => onChange(c.value)}
            >
              {isActive ? (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-3.5 w-3.5",
                    needsLightFg(c.value) ? "text-white" : "text-zinc-900",
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        className={cn(
          "mt-1.5 flex h-8 items-center gap-2 rounded-md border px-2 py-0",
          proposalToolbarTintInputShellClasses(appearance ?? "surface"),
        )}
      >
        <span className={cn("h-5 w-5 shrink-0 rounded-full ring-1", proposalToolbarTintPreviewRingClasses(appearance ?? "surface"))} style={{ backgroundColor: value }} />
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commitDraft()}
          spellCheck={false}
          aria-label={label ? `${label} hex` : "Colour hex"}
          className={cn(
            "h-7 border-0 bg-transparent p-0 text-xs font-medium tabular-nums tracking-tight",
            appearance === "elevated" ? "text-zinc-100" : "text-foreground",
          )}
          placeholder="#0F172A"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      </div>
    </div>
  );
}

function normalizeHex(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(v)) {
    const [r, g, b] = v.split("") as string[];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return undefined;
}

function sameHex(a: string, b: string): boolean {
  const na = normalizeHex(a);
  const nb = normalizeHex(b);
  return !!na && na === nb;
}

function needsLightFg(hex: string): boolean {
  const n = normalizeHex(hex);
  if (!n) return false;
  return n !== "#ffffff" && n !== "#e2e8f0";
}
