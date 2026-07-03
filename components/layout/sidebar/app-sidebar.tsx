"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useIsTablet } from "@/hooks/use-mobile";
import { Logo } from "@/components/layout/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import type { PortalShellProps } from "@/components/layout/nav-types";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> &
  Pick<PortalShellProps, "groups" | "brand">;

export function AppSidebar({ groups, brand, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0!"
            >
              <Link href={brand.href}>
                <Logo
                  logoUrl={brand.logoUrl}
                  portalName={brand.label}
                  className="group-data-[collapsible=icon]:[&>span]:hidden"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain groups={groups} />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
