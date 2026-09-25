import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";

import "./globals.css";

import { ActiveThemeProvider } from "@/components/active-theme";
import { DEFAULT_THEME, DEFAULT_THEME_COLOR, isThemeColorId } from "@/lib/themes";
import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PROPOSAL_GOOGLE_FONTS_STYLESHEET_HREF } from "@/lib/proposal/rich-text/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const appearance = await getPortalAppearanceSettings();
  const portalName = appearance?.portalName?.trim() || "Code Zero Labs";

  return {
    title: `${portalName} Portal`,
    description: "CRM, billing, and proposals for Code Zero Labs.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appearance = await getPortalAppearanceSettings();
  const cookieStore = await cookies();
  const themeSettings = {
    preset: DEFAULT_THEME.preset,
    scale: (cookieStore.get("theme_scale")?.value ?? DEFAULT_THEME.scale) as never,
    radius: (cookieStore.get("theme_radius")?.value ?? DEFAULT_THEME.radius) as never,
    contentLayout: (cookieStore.get("theme_content_layout")?.value ??
      DEFAULT_THEME.contentLayout) as never,
  };

  const bodyAttributes = Object.fromEntries(
    Object.entries(themeSettings)
      .filter(([, value]) => value)
      .map(([key, value]) => [`data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value]),
  );

  const themeColor =
    appearance?.themeColor && isThemeColorId(appearance.themeColor)
      ? appearance.themeColor
      : DEFAULT_THEME_COLOR;
  const themeColorAttributes =
    themeColor === "default"
      ? {}
      : {
          "data-theme-color": themeColor,
          "data-theme-chart-preset": themeColor,
        };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={PROPOSAL_GOOGLE_FONTS_STYLESHEET_HREF} />
      </head>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}
        {...themeColorAttributes}
        {...bodyAttributes}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ActiveThemeProvider initialTheme={themeSettings}>
            <TooltipProvider>
              {children}
              <Toaster position="top-center" richColors />
              <NextTopLoader color="var(--primary)" showSpinner={false} height={2} />
            </TooltipProvider>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
