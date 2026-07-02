import type { Row } from "@tanstack/react-table";

export function multiSelectColumnFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  const values = filterValue as string[] | undefined;
  if (!values?.length) return true;
  return values.includes(String(row.getValue(columnId) ?? ""));
}
