import { MapPin, Shield, Users } from "lucide-react";

import type { CatalogServiceRecord } from "@/types/catalog-service";

const PLAN_ENTITLEMENT_STATS = [
  { key: "users", label: "Users", icon: Users, field: "includedUsers" as const },
  { key: "locations", label: "Locations", icon: MapPin, field: "includedLocations" as const },
  { key: "admins", label: "Admins", icon: Shield, field: "includedAdmins" as const },
] as const;

export interface CatalogServiceEntitlementStatsProps {
  service: CatalogServiceRecord;
}

/** Product-detail e-commerce metric tiles for plan entitlements. */
export function CatalogServiceEntitlementStats({ service }: CatalogServiceEntitlementStatsProps) {
  if (service.serviceType === "addon") return null;

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {PLAN_ENTITLEMENT_STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4"
          >
            <Icon className="size-6 opacity-40" aria-hidden />
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <span className="text-lg font-semibold tabular-nums">{service[stat.field]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
