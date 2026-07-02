"use client";

import * as React from "react";

import { LocalityEditSheet } from "@/components/features/settings/locality-edit-sheet";
import { LocalitySettingsView } from "@/components/features/settings/locality-settings-view";
import type { PortalUser } from "@/types/user";

export interface LocalitySettingsPageClientProps {
  initialUser: PortalUser;
  timeZones: string[];
  currencyCodes: string[];
}

export function LocalitySettingsPageClient({
  initialUser,
  timeZones,
  currencyCodes,
}: LocalitySettingsPageClientProps) {
  const [user, setUser] = React.useState(initialUser);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <>
      <LocalitySettingsView user={user} onEdit={() => setEditOpen(true)} />
      <LocalityEditSheet
        user={user}
        timeZones={timeZones}
        currencyCodes={currencyCodes}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={setUser}
      />
    </>
  );
}
