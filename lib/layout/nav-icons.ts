import {
  BadgeDollarSignIcon,
  Building2Icon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  FileTextIcon,
  LayoutTemplateIcon,
  PackageIcon,
  SettingsIcon,
  SquareCheckIcon,
  SquareKanbanIcon,
  UsersIcon,
  WalletMinimalIcon,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: ChartPieIcon,
  financials: BadgeDollarSignIcon,
  accounts: Building2Icon,
  customers: UsersIcon,
  opportunities: SquareKanbanIcon,
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
  return NAV_ICONS[id] ?? ChartPieIcon;
}

export { NAV_ICONS };
