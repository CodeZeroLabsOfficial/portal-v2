/** Build a column-id → items record for Kanban board state. */
export function buildKanbanColumns<T>(
  columnIds: readonly string[],
  items: T[],
  getColumnId: (item: T) => string
): Record<string, T[]> {
  const record: Record<string, T[]> = {};
  for (const id of columnIds) {
    record[id] = [];
  }
  const fallback = columnIds[0];
  for (const item of items) {
    const col = getColumnId(item);
    if (record[col]) {
      record[col].push(item);
    } else if (fallback) {
      record[fallback]!.push(item);
    }
  }
  return record;
}

export interface KanbanCrossColumnMove {
  id: string;
  oldColumn: string;
  newColumn: string;
}

/** Returns the first item that moved to a different column between two board snapshots. */
export function detectCrossColumnMove<T>(
  prev: Record<string, T[]>,
  next: Record<string, T[]>,
  getItemId: (item: T) => string
): KanbanCrossColumnMove | null {
  const prevColumnById = new Map<string, string>();
  for (const [col, colItems] of Object.entries(prev)) {
    for (const item of colItems) {
      prevColumnById.set(getItemId(item), col);
    }
  }

  for (const [col, colItems] of Object.entries(next)) {
    for (const item of colItems) {
      const id = getItemId(item);
      const oldColumn = prevColumnById.get(id);
      if (oldColumn && oldColumn !== col) {
        return { id, oldColumn, newColumn: col };
      }
    }
  }

  return null;
}
