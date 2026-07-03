import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
    /** Human label for the View column toggle menu. */
    viewLabel?: string;
  }
}
