/** Values persisted on tasks and shown on Kanban cards. */
export const TASK_PRIORITY_VALUES = ["low", "medium", "high"] as const;

export type TaskPriorityValue = (typeof TASK_PRIORITY_VALUES)[number];

export const DEFAULT_TASK_PRIORITY: TaskPriorityValue = "medium";

export function taskPriorityLabel(value: TaskPriorityValue): string {
  switch (value) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}

/** Normalizes arbitrary stored `priority` strings to the canonical picker values (incl. legacy rows). */
export function coerceTaskPriority(raw: string | undefined): TaskPriorityValue {
  const s = (raw ?? "").trim().toLowerCase();
  if ((TASK_PRIORITY_VALUES as readonly string[]).includes(s)) {
    return s as TaskPriorityValue;
  }
  if (s === "normal") return "medium";
  if (s === "premium") return "high";
  return DEFAULT_TASK_PRIORITY;
}

/** Colored dots for priority filter toggles (UI kit todo list pattern). */
export const TASK_PRIORITY_DOT_CLASSES: Record<TaskPriorityValue, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
};
