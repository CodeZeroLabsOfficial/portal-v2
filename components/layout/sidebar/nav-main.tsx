"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSignIcon,
  Building2Icon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  FileTextIcon,
  GaugeIcon,
  LayoutTemplateIcon,
  PackageIcon,
  SettingsIcon,
  SquareCheckIcon,
  UsersIcon,
  WalletMinimalIcon,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { PortalNavItemView } from "@/components/layout/nav-types";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: GaugeIcon,
  accounts: Building2Icon,
  customers: UsersIcon,
  opportunities: ChartPieIcon,
  proposals: FileTextIcon,
  subscriptions: WalletMinimalIcon,
  services: PackageIcon,
  tasks: SquareCheckIcon,
  templates: LayoutTemplateIcon,
  reports: ChartBarDecreasingIcon,
  settings: SettingsIcon,
  customer: BadgeDollarSignIcon,
};

function isNavActive(href: string, pathname: string): boolean {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  if (href === "/admin" || href === "/dashboard") {
    return normalized === href;
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

function NavRow({ item, pathname }: { item: PortalNavItemView; pathname: string }) {
  const Icon = NAV_ICONS[item.id] ?? GaugeIcon;
  const active = isNavActive(item.href, pathname);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({
  items,
  footerItems,
}: {
  items: PortalNavItemView[];
  footerItems: PortalNavItemView[];
}) {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <NavRow key={item.id} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {footerItems.length > 0 ? (
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => (
                <NavRow key={item.id} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}
    </>
  );
}
