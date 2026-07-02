import { KeyRound } from "lucide-react";

import { CustomerTabEmptyState } from "@/components/features/crm/customer/customer-tab-empty-state";

export function CustomerVaultTab() {
  return (
    <CustomerTabEmptyState icon={KeyRound}>
      <p>
        Customer credentials for app development, integrations, hosting, and related access details will be
        stored here.
      </p>
    </CustomerTabEmptyState>
  );
}
