"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { PortalNavGroupView, PortalNavItemView } from "@/components/layout/nav-types";
import { navIconForId } from "@/lib/layout/nav-icons";

const navButtonClassName =
  "hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10";

function isNavActive(item: PortalNavItemView, pathname: string): boolean {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const { href, id } = item;
  if (href === "/admin" || href === "/dashboard") {
    return normalized === href;
  }
  if (id === "proposals") {
    if (normalized === "/admin/proposals") return true;
    if (!normalized.startsWith("/admin/proposals/")) return false;
    if (normalized.startsWith("/admin/proposals/templates")) return false;
    return true;
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

function NavRow({ item, pathname }: { item: PortalNavItemView; pathname: string }) {
  const Icon = navIconForId(item.id);
  const active = isNavActive(item, pathname);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className={navButtonClassName}
      >
        <Link href={item.href}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ groups }: { groups: PortalNavGroupView[] }) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group, index) => (
        <SidebarGroup
          key={group.id}
          className={index === groups.length - 1 ? "mt-auto" : undefined}
        >
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => (
                <NavRow key={item.id} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
