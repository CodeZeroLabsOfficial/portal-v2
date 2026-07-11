"use server";

import { requireStaffSession } from "@/lib/auth/server-session";
import { logError } from "@/lib/common/logging";
import {
  createCatalogCategoryForOrg,
  listCatalogCategoryOptionsForOrg,
} from "@/server/firestore/catalog-categories";
import type { CatalogCategoryOption } from "@/types/catalog-category";

export async function listCatalogCategoryOptionsAction(): Promise<
  { ok: true; categories: CatalogCategoryOption[] } | { ok: false; message: string }
> {
  try {
    const user = await requireStaffSession();
    if (!user) return { ok: false, message: "Unauthorized." };
    const categories = await listCatalogCategoryOptionsForOrg(user);
    return { ok: true, categories };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("listCatalogCategoryOptionsAction_failed", { message });
    return { ok: false, message: "Could not load categories." };
  }
}

export async function createCatalogCategoryAction(
  label: string,
): Promise<
  { ok: true; category: CatalogCategoryOption } | { ok: false; message: string }
> {
  try {
    const user = await requireStaffSession();
    if (!user) return { ok: false, message: "Unauthorized." };
    return await createCatalogCategoryForOrg(user, label);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("createCatalogCategoryAction_failed", { message });
    return { ok: false, message: "Could not create category." };
  }
}
