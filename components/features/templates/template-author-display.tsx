import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsFromName } from "@/lib/common/format";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/lib/users/user-summaries";

export interface TemplateAuthorDisplayProps {
  author?: UserSummary;
  className?: string;
}

export function TemplateAuthorDisplay({ author, className }: TemplateAuthorDisplayProps) {
  const authorName = author?.displayName?.trim() || "Team member";
  const authorInitials = initialsFromName(authorName);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="size-6 shrink-0" title={authorName}>
        {author?.photoURL ? <AvatarImage src={author.photoURL} alt="" /> : null}
        <AvatarFallback className="text-[10px] font-semibold">{authorInitials}</AvatarFallback>
      </Avatar>
      <p className="truncate text-sm font-medium leading-none">{authorName}</p>
    </div>
  );
}
