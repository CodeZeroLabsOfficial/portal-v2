"use client";

import * as React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Crop,
  ImageIcon,
  LayoutGrid,
  Link2,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import type { ImageBlock } from "@/types/proposal";
import { useProposalMediaLibraryOptional } from "@/components/proposal/proposal-media-library";
import { PROPOSAL_MEDIA_LIBRARY_DEFAULT_PREFIX } from "@/lib/proposal/media/media-library-blob";
import {
  fetchProposalMediaLibraryPrefix,
  uploadImageFileToProposalLibrary,
} from "@/lib/proposal/media/image-library-upload";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ProposalToolbarIconButton,
  ProposalToolbarSectionLabel,
  ProposalToolbarSeparator,
  ProposalToolbarShell,
} from "@/components/features/proposal/editor/toolbar";
import {
  PROPOSAL_TOOLBAR_TOKENS,
} from "@/lib/proposal/editor-toolbar-tokens";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isProposalImagePlaceholderUrl, PROPOSAL_IMAGE_BLOCK_PLACEHOLDER_URL } from "@/components/proposal/proposal-image-block-editor";

/** Matches {@link ProposalBlockToolbar} shell chrome for the current section band. */
const barShellClassName =
  "max-w-[calc(100vw-3rem)] shrink-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export type ProposalImageBlockToolbarProps = {
  variant: "shell" | "embedded";
  block: ImageBlock;
  onChange: (next: ImageBlock) => void;
  className?: string;
  onDelete?: () => void;
};

export function ProposalImageBlockToolbar({
  variant,
  block,
  onChange,
  className,
  onDelete,
}: ProposalImageBlockToolbarProps) {
  const mediaLibrary = useProposalMediaLibraryOptional();
  const [prefix, setPrefix] = React.useState(PROPOSAL_MEDIA_LIBRARY_DEFAULT_PREFIX);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkDraft, setLinkDraft] = React.useState(block.href ?? "");
  const [altOpen, setAltOpen] = React.useState(false);
  const [altDraft, setAltDraft] = React.useState(block.alt ?? "");
  const [capDraft, setCapDraft] = React.useState(block.caption ?? "");

  React.useEffect(() => {
    let cancelled = false;
    void fetchProposalMediaLibraryPrefix().then((p) => {
      if (!cancelled) setPrefix(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (linkOpen) setLinkDraft(block.href ?? "");
  }, [linkOpen, block.href]);

  React.useEffect(() => {
    if (altOpen) {
      setAltDraft(block.alt ?? "");
      setCapDraft(block.caption ?? "");
    }
  }, [altOpen, block.alt, block.caption]);

  const applyUrl = (url: string) => onChange({ ...block, url });

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(file.name)) return;
    setUploading(true);
    try {
      const url = await uploadImageFileToProposalLibrary(prefix, file);
      applyUrl(url);
    } catch {
      /* toast optional */
    } finally {
      setUploading(false);
    }
  };

  const openLibrary = () => {
    if (!mediaLibrary) return;
    mediaLibrary.openSelection({
      allowedKinds: ["image"],
      onSelect: (asset) => {
        if (asset.kind !== "image") return;
        applyUrl(asset.downloadUrl);
      },
    });
  };

  const openExplore = () => {
    if (!mediaLibrary) return;
    mediaLibrary.openSelection({
      allowedKinds: ["image"],
      initialMainTab: "explore",
      onSelect: (asset) => {
        if (asset.kind !== "image") return;
        applyUrl(asset.downloadUrl);
      },
    });
  };

  const align = block.align ?? "center";
  const hasImage = !isProposalImagePlaceholderUrl(block.url);

  const applyLink = () => {
    const t = linkDraft.trim();
    onChange({ ...block, href: t ? t : undefined });
    setLinkOpen(false);
  };

  const applyAltCaption = () => {
    onChange({
      ...block,
      alt: altDraft.trim() ? altDraft.trim() : undefined,
      caption: capDraft.trim() ? capDraft.trim() : undefined,
    });
    setAltOpen(false);
  };

  const setAlign = (next: NonNullable<ImageBlock["align"]>) => {
    onChange({ ...block, align: next });
  };

  return (
    <div className={cn("pointer-events-auto", className)} data-proposal-image-toolbar={variant}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.avif,.svg"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void uploadFile(f);
        }}
      />

      <ProposalToolbarShell
        className={cn("p-1", barShellClassName)}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <ProposalToolbarIconButton
              active={Boolean(block.href?.trim())}
              aria-label="Image link"
              title="Link"
            >
              <Link2 className="h-4 w-4" />
            </ProposalToolbarIconButton>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start" sideOffset={8} onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor={`img-href-${block.id}`} className="text-xs">
                URL
              </Label>
              <Input
                id={`img-href-${block.id}`}
                value={linkDraft}
                onChange={(e) => setLinkDraft(e.target.value)}
                placeholder="https://…"
                className="h-9"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setLinkOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" className="h-8 text-xs" onClick={applyLink}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ProposalToolbarIconButton
              aria-label="Replace image"
              title="Replace image"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </ProposalToolbarIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[11rem]" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={(e) => {
                e.preventDefault();
                fileRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4" /> Upload
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              disabled={!mediaLibrary}
              onClick={(e) => {
                e.preventDefault();
                openLibrary();
              }}
            >
              <LayoutGrid className="h-4 w-4" /> Library
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              disabled={!mediaLibrary}
              onClick={(e) => {
                e.preventDefault();
                openExplore();
              }}
            >
              <Search className="h-4 w-4" /> Explore
            </DropdownMenuItem>
            {hasImage ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-muted-foreground focus:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    applyUrl(PROPOSAL_IMAGE_BLOCK_PLACEHOLDER_URL);
                  }}
                >
                  Clear image
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        <ProposalToolbarIconButton title="Crop (coming soon)" aria-label="Crop (coming soon)" disabled>
          <Crop className="h-4 w-4" />
        </ProposalToolbarIconButton>

        <Popover open={altOpen} onOpenChange={setAltOpen}>
          <PopoverTrigger asChild>
            <ProposalToolbarIconButton
              active={Boolean(block.alt?.trim() || block.caption?.trim())}
              aria-label="Alt text and caption"
              title="Alt text and caption"
              className={cn("min-w-8 px-1.5 font-bold tracking-wide", PROPOSAL_TOOLBAR_TOKENS.surface.menuItemCompact)}
            >
              ALT
            </ProposalToolbarIconButton>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="center" sideOffset={8} onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={`toolbar-alt-${block.id}`} className="text-xs">
                  Alt text
                </Label>
                <Input id={`toolbar-alt-${block.id}`} value={altDraft} onChange={(e) => setAltDraft(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`toolbar-cap-${block.id}`} className="text-xs">
                  Caption
                </Label>
                <Input id={`toolbar-cap-${block.id}`} value={capDraft} onChange={(e) => setCapDraft(e.target.value)} className="h-9" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setAltOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" className="h-8 text-xs" onClick={applyAltCaption}>
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ProposalToolbarIconButton
          active={align === "left"}
          aria-label="Align left"
          title="Align left"
          onClick={() => setAlign("left")}
        >
          <AlignLeft className="h-4 w-4" />
        </ProposalToolbarIconButton>
        <ProposalToolbarIconButton
          active={align === "center"}
          aria-label="Align center"
          title="Align center"
          onClick={() => setAlign("center")}
        >
          <AlignCenter className="h-4 w-4" />
        </ProposalToolbarIconButton>
        <ProposalToolbarIconButton
          active={align === "right"}
          aria-label="Align right"
          title="Align right"
          onClick={() => setAlign("right")}
        >
          <AlignRight className="h-4 w-4" />
        </ProposalToolbarIconButton>

        {onDelete ? (
          <>
            <ProposalToolbarSeparator />
            <ProposalToolbarIconButton
              aria-label="Delete block"
              title="Delete block"
              className="text-destructive hover:bg-red-500/15 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </ProposalToolbarIconButton>
          </>
        ) : null}
      </ProposalToolbarShell>
    </div>
  );
}
