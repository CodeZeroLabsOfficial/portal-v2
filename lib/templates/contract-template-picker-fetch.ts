import type { ContractTemplatePickerRow } from "@/lib/templates/contract-template-picker";

let pickerRowsCache: Map<string, ContractTemplatePickerRow[]> = new Map();
let pickerRowsInflight: Map<string, Promise<ContractTemplatePickerRow[]>> = new Map();

function pickerRowsCacheKey(includeId?: string): string {
  return includeId?.trim() || "";
}

export async function fetchContractTemplatePickerRows(
  options?: { force?: boolean; includeId?: string },
): Promise<ContractTemplatePickerRow[]> {
  const includeId = options?.includeId?.trim() || undefined;
  const cacheKey = pickerRowsCacheKey(includeId);

  if (!options?.force && pickerRowsCache.has(cacheKey)) {
    return pickerRowsCache.get(cacheKey)!;
  }
  if (!options?.force && pickerRowsInflight.has(cacheKey)) {
    return pickerRowsInflight.get(cacheKey)!;
  }

  const query = includeId ? `?includeId=${encodeURIComponent(includeId)}` : "";
  const promise = fetch(`/api/contract-templates${query}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json() as Promise<{ templates?: ContractTemplatePickerRow[] }>;
    })
    .then((data) => {
      const templates = Array.isArray(data.templates) ? data.templates : [];
      pickerRowsCache.set(cacheKey, templates);
      pickerRowsInflight.delete(cacheKey);
      return templates;
    })
    .catch((err) => {
      pickerRowsInflight.delete(cacheKey);
      throw err;
    });

  pickerRowsInflight.set(cacheKey, promise);
  return promise;
}
