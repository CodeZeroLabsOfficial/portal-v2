import type { Row } from "@tanstack/react-table";

export type SelectFilterOperator = "is" | "is_not" | "is_any_of" | "is_none_of" | "empty" | "not_empty";

export interface SelectFilterValue {
  operator: SelectFilterOperator;
  values: string[];
}

export const SELECT_FILTER_OPERATORS: {
  value: SelectFilterOperator;
  label: string;
  arity: "one" | "many" | "none";
}[] = [
  { value: "is", label: "is", arity: "one" },
  { value: "is_not", label: "is not", arity: "one" },
  { value: "is_any_of", label: "is any of", arity: "many" },
  { value: "is_none_of", label: "is none of", arity: "many" },
  { value: "empty", label: "is empty", arity: "none" },
  { value: "not_empty", label: "is not empty", arity: "none" }
];

export function selectFilterOperator(operator: SelectFilterOperator | null) {
  return SELECT_FILTER_OPERATORS.find((entry) => entry.value === operator);
}

export function readSelectFilter(filterValue: unknown): SelectFilterValue | null {
  if (!filterValue || typeof filterValue !== "object" || Array.isArray(filterValue)) return null;
  const value = filterValue as Partial<SelectFilterValue>;
  if (!value.operator) return null;
  return {
    operator: value.operator,
    values: Array.isArray(value.values) ? value.values : []
  };
}

/** Applies a select condition. A plain string list is treated as "is any of". */
export function multiSelectColumnFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  const cell = String(row.getValue(columnId) ?? "");
  if (Array.isArray(filterValue)) {
    if (!filterValue.length) return true;
    return filterValue.includes(cell);
  }

  const filter = readSelectFilter(filterValue);
  if (!filter) return true;
  const { operator, values } = filter;
  const isEmpty = cell === "";

  switch (operator) {
    case "empty":
      return isEmpty;
    case "not_empty":
      return !isEmpty;
    case "is":
      if (!values.length) return true;
      return cell === values[0];
    case "is_not":
      if (!values.length) return true;
      return cell !== values[0];
    case "is_none_of":
      if (!values.length) return true;
      return !values.includes(cell);
    case "is_any_of":
      if (!values.length) return true;
      return values.includes(cell);
    default:
      return true;
  }
}
