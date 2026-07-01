import { CustomerShellLayout } from "@/components/layout/customer-shell-layout";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShellLayout currentPath="/customer">{children}</CustomerShellLayout>;
}
