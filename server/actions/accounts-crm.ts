"use server";

import { revalidatePath } from "next/cache";
import { requireStaffSession } from "@/lib/auth/server-session";
import { createAccountFormSchema, updateAccountFormSchema } from "@/lib/schemas/account";
import { zodErrorToMessage } from "@/lib/common/zod-error";
import {
  createAccountDocument,
  deleteAccountDocument,
  getAccountDetailForId,
  listAccountRecordsForStaff,
  updateAccountDocument,
} from "@/server/firestore/crm-accounts";
import type { AccountDetailAggregate, AccountRecord } from "@/types/account";

export async function listAccountsForPickerAction(): Promise<
  { ok: true; accounts: AccountRecord[] } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need an admin or team session to list accounts." };
  }
  const accounts = await listAccountRecordsForStaff(user);
  if (!accounts) {
    return { ok: false, message: "Could not load accounts." };
  }
  return { ok: true, accounts };
}

export async function getAccountDetailAction(
  accountId: string,
): Promise<
  { ok: true; account: AccountDetailAggregate } | { ok: false; message: string }
> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need an admin or team session to edit accounts." };
  }
  const id = accountId.trim();
  if (!id) {
    return { ok: false, message: "Account id is required." };
  }
  const account = await getAccountDetailForId(user, id);
  if (!account) {
    return { ok: false, message: "Account not found." };
  }
  return { ok: true, account };
}

export async function updateAccountAction(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need an admin or team session to edit accounts." };
  }
  const parsed = updateAccountFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const result = await updateAccountDocument(user, parsed.data);
  if (!result.ok) return result;

  revalidatePath("/admin/customers", "layout");
  revalidatePath("/admin/accounts", "layout");
  revalidatePath(`/admin/accounts/${parsed.data.id}`, "page");
  return { ok: true };
}

export async function createAccountAction(
  raw: unknown,
): Promise<{ ok: true; accountId: string } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "You need an admin or team session to add accounts." };
  }
  const parsed = createAccountFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: zodErrorToMessage(parsed.error) };
  }

  const result = await createAccountDocument(user, parsed.data);
  if (!result.ok) return result;

  revalidatePath("/admin/accounts", "layout");
  revalidatePath(`/admin/accounts/${result.accountId}`, "page");
  return { ok: true, accountId: result.accountId };
}

export async function deleteAccountAction(
  accountId: string,
): Promise<{ ok: true; deletedCustomers: number } | { ok: false; message: string }> {
  const user = await requireStaffSession();
  if (!user) {
    return { ok: false, message: "Unauthorized." };
  }
  const result = await deleteAccountDocument(user, accountId);
  if (!result.ok) return result;

  revalidatePath("/admin/customers", "layout");
  revalidatePath("/admin/accounts", "layout");
  revalidatePath("/admin/proposals", "layout");
  revalidatePath("/admin/subscriptions", "layout");
  return { ok: true, deletedCustomers: result.deletedCustomers };
}
