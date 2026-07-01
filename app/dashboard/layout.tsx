import { CustomerShellLayout } from "@/components/layout/customer-shell-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShellLayout currentPath="/dashboard">{children}</CustomerShellLayout>;
}
