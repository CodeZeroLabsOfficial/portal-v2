"use client";

import { CustomerNotesPanel } from "@/components/features/crm/customer/notes/notes-panel";
import type { CustomerActivityRecord, CustomerNoteRecord, CustomerRecord } from "@/types/customer";

export interface CustomerNotesTabProps {
  customer: CustomerRecord;
  notes: CustomerNoteRecord[];
  activities: CustomerActivityRecord[];
}

export function CustomerNotesTab({ customer, notes, activities }: CustomerNotesTabProps) {
  return <CustomerNotesPanel customerId={customer.id} notes={notes} activities={activities} />;
}
