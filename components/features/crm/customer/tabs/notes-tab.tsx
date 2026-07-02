"use client";

import { CustomerNotesPanel } from "@/components/features/crm/customer/notes/notes-panel";
import type { CustomerNoteRecord, CustomerRecord } from "@/types/customer";

export interface CustomerNotesTabProps {
  customer: CustomerRecord;
  notes: CustomerNoteRecord[];
}

export function CustomerNotesTab({ customer, notes }: CustomerNotesTabProps) {
  return <CustomerNotesPanel customerId={customer.id} notes={notes} />;
}
