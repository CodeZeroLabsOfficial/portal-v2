import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { notificationVisual } from "@/lib/notification/visual";
import { cn } from "@/lib/utils";
import type { NotificationRecord } from "@/types/notification";

export interface NotificationVisualProps {
  notification: NotificationRecord;
  className?: string;
  iconClassName?: string;
}

export function NotificationVisual({
  notification,
  className,
  iconClassName = "size-4",
}: NotificationVisualProps) {
  const visual = notificationVisual(notification);

  if (visual.kind === "avatar") {
    return (
      <Avatar className={cn("size-10 shrink-0", className)}>
        <AvatarFallback className={visual.className}>{visual.initials}</AvatarFallback>
      </Avatar>
    );
  }

  const Icon = visual.Icon;
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        visual.className,
        className,
      )}
    >
      <Icon className={iconClassName} />
    </div>
  );
}
