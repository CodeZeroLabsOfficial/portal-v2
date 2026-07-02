import { cn } from "@/lib/utils";

interface KanbanProgressRingProps {
  /** Progress value from 0–100. */
  value: number;
  className?: string;
}

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Circular progress indicator matching the UI kit Kanban task cards. */
function KanbanProgressRing({ value, className }: KanbanProgressRingProps) {
  const pct = Math.min(100, Math.max(0, value));
  const offset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * pct) / 100;

  return (
    <div className={cn("flex items-center gap-2 rounded-lg border p-1", className)}>
      <div className="relative size-4">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="18"
            cy="18"
            r={RING_RADIUS}
            fill="none"
            className="stroke-current text-gray-200 dark:text-neutral-700"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r={RING_RADIUS}
            fill="none"
            className={cn("stroke-current", {
              "text-green-600!": pct === 100,
              "text-orange-500!": pct > 50 && pct < 100
            })}
            strokeWidth="2"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="tabular-nums">{`${pct}%`}</span>
    </div>
  );
}

export { KanbanProgressRing };
export type { KanbanProgressRingProps };
