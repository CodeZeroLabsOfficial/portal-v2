"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { ThemeColorSelector } from "@/components/features/settings/theme-color-selector";
import { ThemeModeSelector } from "@/components/features/settings/theme-mode-selector";
import { useFileUpload } from "@/hooks/use-file-upload";
import { DEFAULT_THEME_COLOR, isThemeColorId, type ThemeColorId } from "@/lib/themes";
import { updatePortalAppearanceSettingsAction } from "@/server/actions/appearance-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import type { PortalAppearanceSettings } from "@/types/appearance";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function applyPortalThemeColor(themeColor: ThemeColorId) {
  const body = document.body;
  body.removeAttribute("data-theme-font");
  body.removeAttribute("data-has-portal-primary");
  body.style.removeProperty("--portal-primary");
  if (themeColor === "default") {
    body.removeAttribute("data-theme-color");
    body.removeAttribute("data-theme-chart-preset");
    return;
  }
  body.setAttribute("data-theme-color", themeColor);
  body.setAttribute("data-theme-chart-preset", themeColor);
}

interface ImageUploadFieldProps {
  label: string;
  title: string;
  description: string;
  previewUrl: string | null;
  errors: string[];
  onOpenDialog: () => void;
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & { ref: React.Ref<HTMLInputElement> };
  alt: string;
}

function ImageUploadField({
  label,
  title,
  description,
  previewUrl,
  errors,
  onOpenDialog,
  inputProps,
  alt,
}: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Item
        variant="outline"
        className="cursor-pointer"
        onClick={onOpenDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDialog();
          }
        }}
      >
        <ItemMedia variant="image">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={alt}
              width={40}
              height={40}
              className="aspect-square size-10 rounded-sm object-cover"
              unoptimized={previewUrl.startsWith("blob:")}
            />
          ) : (
            <div className="bg-muted flex size-full items-center justify-center">
              <UploadIcon className="text-muted-foreground size-4" />
            </div>
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <UploadIcon className="text-muted-foreground size-4" />
        </ItemActions>
      </Item>
      <input {...inputProps} className="sr-only" aria-label={label} />
      {errors.length > 0 && <p className="text-destructive text-sm">{errors[0]}</p>}
    </div>
  );
}

async function uploadBrandingFile(
  endpoint: "/api/settings/branding/logo" | "/api/settings/branding/favicon",
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch(endpoint, { method: "POST", body: formData });
  const json = (await response.json()) as { logoUrl?: string; faviconUrl?: string; error?: string };
  if (!response.ok) {
    throw new Error(json.error ?? "Upload failed.");
  }
  const url = endpoint.endsWith("/logo") ? json.logoUrl : json.faviconUrl;
  if (!url) {
    throw new Error("Upload failed.");
  }
  return url;
}

export interface AppearanceSettingsPageClientProps {
  initialSettings: PortalAppearanceSettings;
}

export function AppearanceSettingsPageClient({
  initialSettings,
}: AppearanceSettingsPageClientProps) {
  const router = useRouter();
  const [appearance, setAppearance] = useState(initialSettings);
  const [themeColor, setThemeColor] = useState<ThemeColorId>(
    initialSettings.themeColor && isThemeColorId(initialSettings.themeColor)
      ? initialSettings.themeColor
      : DEFAULT_THEME_COLOR,
  );
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSettings.logoUrl ?? null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialSettings.faviconUrl ?? null);

  const [
    { files: logoFiles, errors: logoErrors },
    { openFileDialog: openLogoDialog, getInputProps: getLogoInputProps, clearFiles: clearLogoFiles },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/webp,image/svg+xml",
    maxSize: MAX_IMAGE_BYTES,
  });

  const [
    { files: faviconFiles, errors: faviconErrors },
    {
      openFileDialog: openFaviconDialog,
      getInputProps: getFaviconInputProps,
      clearFiles: clearFaviconFiles,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico",
    maxSize: MAX_IMAGE_BYTES,
  });

  const logoPreviewUrl = logoFiles[0]?.preview ?? logoUrl;
  const faviconPreviewUrl = faviconFiles[0]?.preview ?? faviconUrl;

  useEffect(() => {
    setAppearance(initialSettings);
    setLogoUrl(initialSettings.logoUrl ?? null);
    setFaviconUrl(initialSettings.faviconUrl ?? null);
    setThemeColor(
      initialSettings.themeColor && isThemeColorId(initialSettings.themeColor)
        ? initialSettings.themeColor
        : DEFAULT_THEME_COLOR,
    );
  }, [initialSettings]);

  const persistedThemeColor =
    appearance.themeColor && isThemeColorId(appearance.themeColor)
      ? appearance.themeColor
      : DEFAULT_THEME_COLOR;
  const persistedThemeColorRef = useRef(persistedThemeColor);
  persistedThemeColorRef.current = persistedThemeColor;

  useEffect(() => {
    applyPortalThemeColor(themeColor);
  }, [themeColor]);

  useEffect(() => {
    return () => applyPortalThemeColor(persistedThemeColorRef.current);
  }, []);

  async function onSubmitPortal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    let nextLogoUrl = logoUrl ?? "";
    let nextFaviconUrl = faviconUrl ?? "";

    const uploadedLogo = logoFiles[0]?.file;
    if (uploadedLogo instanceof File) {
      try {
        nextLogoUrl = await uploadBrandingFile("/api/settings/branding/logo", uploadedLogo);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not upload logo.");
        return;
      }
    }

    const uploadedFavicon = faviconFiles[0]?.file;
    if (uploadedFavicon instanceof File) {
      try {
        nextFaviconUrl = await uploadBrandingFile(
          "/api/settings/branding/favicon",
          uploadedFavicon,
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not upload favicon.");
        return;
      }
    }

    const portalName = String(form.get("portalName") ?? "").trim();

    setSaving(true);
    try {
      const result = await updatePortalAppearanceSettingsAction({
        portalName,
        themeColor,
        logoUrl: nextLogoUrl,
        faviconUrl: nextFaviconUrl,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const saved: PortalAppearanceSettings = {
        portalName,
        themeColor,
        logoUrl: nextLogoUrl || undefined,
        faviconUrl: nextFaviconUrl || undefined,
      };
      setAppearance(saved);
      setLogoUrl(nextLogoUrl || null);
      clearLogoFiles();
      setFaviconUrl(nextFaviconUrl || null);
      clearFaviconFiles();
      toast.success("Portal appearance saved.");
      router.refresh();
    } catch {
      toast.error("Could not save portal appearance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-4">
          <form onSubmit={onSubmitPortal} className="space-y-6" key={appearance.portalName}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="portalName">Portal name</Label>
                <Input
                  id="portalName"
                  name="portalName"
                  defaultValue={appearance.portalName}
                />
              </div>
              <ThemeColorSelector value={themeColor} onValueChange={setThemeColor} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                label="Logo"
                title="Upload logo"
                description="Square image recommended. PNG, JPG, WebP, or SVG. Max 5 MB."
                previewUrl={logoPreviewUrl}
                errors={logoErrors}
                onOpenDialog={openLogoDialog}
                inputProps={getLogoInputProps()}
                alt="Portal logo"
              />
              <ImageUploadField
                label="Favicon"
                title="Upload favicon"
                description="Square image, 32×32 or larger. PNG, ICO, or SVG. Max 5 MB."
                previewUrl={faviconPreviewUrl}
                errors={faviconErrors}
                onOpenDialog={openFaviconDialog}
                inputProps={getFaviconInputProps()}
                alt="Portal favicon"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save portal settings"}
              </Button>
            </div>
          </form>
        </section>

        <Separator />

        <section className="space-y-6">
          <ThemeModeSelector />
        </section>
      </CardContent>
    </Card>
  );
}
