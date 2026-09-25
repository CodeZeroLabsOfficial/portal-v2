"use client";

import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import type { PortalShellProps } from "@/components/layout/nav-types";
import { PORTAL_SHELL_ROOT_ATTR } from "@/lib/layout/portal-shell-layout";

export function PortalShell({
  user,
  groups,
  brand,
  searchScope,
  defaultOpen,
  children,
}: PortalShellProps & { defaultOpen: boolean; children: React.ReactNode }) {
  return (
    <SidebarProvider
      {...{ [PORTAL_SHELL_ROOT_ATTR]: "" }}
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)",
          "--content-padding": "calc(var(--spacing) * 6)",
          "--content-margin": "calc(var(--spacing) * 1.5)",
          "--content-full-height":
            "calc(100vh - var(--header-height) - (var(--content-padding) * 2.2) - (var(--content-margin) * 2.2))",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" groups={groups} brand={brand} />
      <SidebarInset>
        <SiteHeader user={user} searchScope={searchScope} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main p-(--content-padding) xl:group-data-[theme-content-layout=centered]/layout:mx-auto xl:group-data-[theme-content-layout=centered]/layout:w-full xl:group-data-[theme-content-layout=centered]/layout:max-w-7xl">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
