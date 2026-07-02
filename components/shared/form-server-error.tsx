import { cn } from "@/lib/utils";

interface FormServerErrorProps {
  /** Error message string; renders nothing when null/empty. */
  message: string | null;
  className?: string;
}

/** Alert banner for server action `{ ok: false, message }` responses above forms. */
export function FormServerError({ message, className }: FormServerErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      {message}
    </div>
  );
}
