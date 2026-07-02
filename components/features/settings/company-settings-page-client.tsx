"use client";

import * as React from "react";

import { CompanyEditSheet } from "@/components/features/settings/company-edit-sheet";
import { CompanySettingsView } from "@/components/features/settings/company-settings-view";
import type { WorkspaceCompanySettings } from "@/types/organization";

export interface CompanySettingsPageClientProps {
  initialSettings: WorkspaceCompanySettings;
}

export function CompanySettingsPageClient({ initialSettings }: CompanySettingsPageClientProps) {
  const [settings, setSettings] = React.useState(initialSettings);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  return (
    <>
      <CompanySettingsView settings={settings} onEdit={() => setEditOpen(true)} />
      <CompanyEditSheet
        settings={settings}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={setSettings}
      />
    </>
  );
}
