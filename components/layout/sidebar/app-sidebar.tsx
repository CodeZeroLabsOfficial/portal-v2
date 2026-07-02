"use client";

import * as React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquareTerminalIcon } from "lucide-react";

import { useIsTablet } from "@/hooks/use-mobile";
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
  Pick<PortalShellProps, "items" | "footerItems" | "brand">;

export function AppSidebar({ items, footerItems, brand, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet, setOpen]);

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
                <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
                  <SquareTerminalIcon className="size-4" />
                </div>
                <span className="text-foreground font-semibold">{brand.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain items={items} footerItems={footerItems} />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
