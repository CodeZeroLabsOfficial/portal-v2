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

export function navIconForId(id: string): LucideIcon {
  return NAV_ICONS[id] ?? GaugeIcon;
}

export { NAV_ICONS };
