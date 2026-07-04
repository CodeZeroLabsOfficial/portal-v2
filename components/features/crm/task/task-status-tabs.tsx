"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TASK_BOARD_COLUMNS,
  taskBoardColumnLabel,
  type TaskBoardColumnId
} from "@/lib/tasks/task-board-columns";

export type TaskStatusFilterTab = "all" | TaskBoardColumnId;

export interface TaskStatusTabsProps {
  activeTab: TaskStatusFilterTab;
  onTabChange: (tab: TaskStatusFilterTab) => void;
}

export function TaskStatusTabs({ activeTab, onTabChange }: TaskStatusTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TaskStatusFilterTab)}>
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        {TASK_BOARD_COLUMNS.map((column) => (
          <TabsTrigger key={column} value={column}>
            {taskBoardColumnLabel(column)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
