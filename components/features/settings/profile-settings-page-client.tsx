"use client";

import * as React from "react";

import { ProfileEditSheet } from "@/components/features/settings/profile-edit-sheet";
import { UserProfileView } from "@/components/features/settings/user-profile-view";
import type { PortalUser } from "@/types/user";

export interface ProfileSettingsPageClientProps {
  initialUser: PortalUser;
}

export function ProfileSettingsPageClient({ initialUser }: ProfileSettingsPageClientProps) {
  const [user, setUser] = React.useState(initialUser);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <>
      <UserProfileView user={user} onEdit={() => setEditOpen(true)} />
      <ProfileEditSheet
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={setUser}
      />
    </>
  );
}
