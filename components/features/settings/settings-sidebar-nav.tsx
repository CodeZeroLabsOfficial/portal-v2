"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SETTINGS_NAV_LIVE } from "@/config/settings-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function isSettingsNavActive(pathname: string, href: string): boolean {
  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return normalized === href || normalized.startsWith(`${href}/`);
}

export function SettingsSidebarNav() {
  const pathname = usePathname();

  return (
    <Card className="py-0">
      <CardContent className="p-2">
        <nav className="flex flex-col space-y-0.5">
          {SETTINGS_NAV_LIVE.map((item) => {
            const active = isSettingsNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn("justify-start", active ? "bg-muted hover:bg-muted" : "hover:bg-muted")}
                asChild
              >
                <Link href={item.href}>
                  <Icon />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
