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

/** Compact bordered metric tiles for plan entitlements (Real Estate detail pattern). */
export function CatalogServiceEntitlementStats({ service }: CatalogServiceEntitlementStatsProps) {
  if (service.serviceType === "addon") return null;

  return (
    <div className="grid shrink-0 grid-cols-3 gap-3 text-sm *:space-y-1 *:rounded-md *:border *:p-3 *:text-center">
      {PLAN_ENTITLEMENT_STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.key}>
            <p className="text-2xl font-semibold tabular-nums">{service[stat.field]}</p>
            <p className="text-muted-foreground inline-flex items-center gap-1">
              <Icon className="size-4" aria-hidden />
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
